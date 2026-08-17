import type { EmptyObject } from "type-fest";

import { RefreshToken } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { AppContextForGuest } from "../contexts.ts";
import * as AccessToken from "../session/access-token.ts";

type RefreshAccessTokenResult = DiscriminatedUnion<{
  InvalidRefreshToken: EmptyObject;
  RefreshTokenNotFound: EmptyObject;
  RefreshTokenExpired: EmptyObject;
  RefreshTokenReuse: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    accessToken: string;
    rawRefreshToken: RefreshToken.Token.Type;
  };
}>;

export async function refreshAccessToken(
  ctx: AppContextForGuest,
  refresh: string,
): Promise<RefreshAccessTokenResult> {
  if (!RefreshToken.Token.is(refresh)) {
    return { type: "InvalidRefreshToken" };
  }

  const hashed = await RefreshToken.Token.hash(refresh);
  try {
    const userId = await ctx.refreshTokenReuseDetector.isUsed(hashed);
    if (userId != null) {
      await ctx.unitOfWork.run(async (repos) => {
        await repos.refreshToken.removeByUserId(userId);
      });
      return { type: "RefreshTokenReuse" };
    }
  } catch (e) {
    ctx.logger.warn(e, "refresh-token-reuse-detection-unavailable");
  }

  const refreshToken = await ctx.repos.refreshToken.find(hashed);
  if (!refreshToken) {
    return { type: "RefreshTokenNotFound" };
  }
  if (RefreshToken.isExpired(refreshToken)) {
    return { type: "RefreshTokenExpired" };
  }

  const { rawRefreshToken, refreshToken: newRefreshToken } = await RefreshToken.create(
    refreshToken.userId,
  );
  try {
    await ctx.unitOfWork.run(async (repos) => {
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
    await ctx.refreshTokenReuseDetector.markUsed({
      token: hashed,
      userId: refreshToken.userId,
      ttlSeconds,
    });
  } catch (e) {
    ctx.logger.warn(e, "refresh-token-mark-used-failed");
  }

  return {
    type: "Success",
    accessToken: await AccessToken.sign({ id: refreshToken.userId }),
    rawRefreshToken,
  };
}
