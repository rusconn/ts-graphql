import type { Logger } from "pino";
import type { EmptyObject } from "type-fest";

import * as RefreshTokenEntity from "../../domain/entities/refresh-token.ts";
import type { IRefreshTokenRepoForGuest } from "../../domain/repositories/refresh-token/for-guest.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { IRefreshTokenReuseDetector } from "../reuse-detectors/refresh-token.ts";
import * as AccessToken from "../session/access-token.ts";
import type { IUnitOfWorkForGuest } from "../unit-of-works/for-guest.ts";

type Deps = {
  repos: { refreshToken: IRefreshTokenRepoForGuest };
  unitOfWork: IUnitOfWorkForGuest;
  refreshTokenReuseDetector: IRefreshTokenReuseDetector;
  logger: Logger;
};

type Input = {
  refreshToken: string;
};

type Output = DiscriminatedUnion<{
  InvalidRefreshToken: EmptyObject;
  RefreshTokenNotFound: EmptyObject;
  RefreshTokenExpired: EmptyObject;
  RefreshTokenReuse: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    accessToken: string;
    rawRefreshToken: RefreshTokenEntity.Token.Type;
  };
}>;

export async function refreshAccessToken(deps: Deps, input: Input): Promise<Output> {
  if (!RefreshTokenEntity.Token.is(input.refreshToken)) {
    return { type: "InvalidRefreshToken" };
  }

  const hashed = await RefreshTokenEntity.Token.hash(input.refreshToken);
  try {
    const userId = await deps.refreshTokenReuseDetector.isUsed(hashed);
    if (userId != null) {
      await deps.unitOfWork.run(async (repos) => {
        await repos.refreshToken.removeByUserId(userId);
      });
      return { type: "RefreshTokenReuse" };
    }
  } catch (e) {
    deps.logger.warn(e, "refresh-token-reuse-detection-unavailable");
  }

  const refreshToken = await deps.repos.refreshToken.find(hashed);
  if (!refreshToken) {
    return { type: "RefreshTokenNotFound" };
  }
  if (RefreshTokenEntity.isExpired(refreshToken)) {
    return { type: "RefreshTokenExpired" };
  }

  const { rawRefreshToken, refreshToken: newRefreshToken } = await RefreshTokenEntity.create(
    refreshToken.userId,
  );
  try {
    await deps.unitOfWork.run(async (repos) => {
      await repos.refreshToken.remove(hashed);
      await repos.refreshToken.add(newRefreshToken);
    });
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  const ttlSeconds = Math.max(1, Math.ceil((refreshToken.expiresAt.getTime() - Date.now()) / 1000));
  try {
    await deps.refreshTokenReuseDetector.markUsed({
      token: hashed,
      userId: refreshToken.userId,
      ttlSeconds,
    });
  } catch (e) {
    deps.logger.warn(e, "refresh-token-mark-used-failed");
  }

  return {
    type: "Success",
    accessToken: await AccessToken.sign({ id: refreshToken.userId }),
    rawRefreshToken,
  };
}
