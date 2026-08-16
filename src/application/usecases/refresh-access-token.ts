import type { EmptyObject } from "type-fest";

import { RefreshToken } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { AppContext } from "../contexts.ts";
import * as AccessToken from "../session/access-token.ts";

type RefreshAccessTokenResult = DiscriminatedUnion<{
  InvalidRefreshToken: EmptyObject;
  RefreshTokenNotFound: EmptyObject;
  RefreshTokenExpired: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    accessToken: string;
    rawRefreshToken: RefreshToken.Token.Type;
  };
}>;

export async function refreshAccessToken(
  ctx: AppContext,
  refresh: string,
): Promise<RefreshAccessTokenResult> {
  if (!RefreshToken.Token.is(refresh)) {
    return { type: "InvalidRefreshToken" };
  }

  const hashed = await RefreshToken.Token.hash(refresh);
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

  return {
    type: "Success",
    accessToken: await AccessToken.sign({ id: refreshToken.userId }),
    rawRefreshToken,
  };
}
