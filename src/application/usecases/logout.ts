import type { EmptyObject } from "type-fest";

import { RefreshToken } from "../../domain/entities.ts";
import { EntityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { IRefreshTokenRepoForAdmin } from "../../domain/repositories/refresh-token/for-admin.ts";
import type { IRefreshTokenRepoForGuest } from "../../domain/repositories/refresh-token/for-guest.ts";
import type { IRefreshTokenRepoForUser } from "../../domain/repositories/refresh-token/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";

type LogoutContext = {
  repos: {
    refreshToken:
      | IRefreshTokenRepoForGuest //
      | IRefreshTokenRepoForUser
      | IRefreshTokenRepoForAdmin;
  };
};

type LogoutResult = DiscriminatedUnion<{
  InvalidRefreshToken: EmptyObject;
  RefreshTokenNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: EmptyObject;
}>;

export async function logout(ctx: LogoutContext, refreshToken: string): Promise<LogoutResult> {
  if (!RefreshToken.Token.is(refreshToken)) {
    return { type: "InvalidRefreshToken" };
  }

  const hashed = await RefreshToken.Token.hash(refreshToken);
  try {
    await ctx.repos.refreshToken.remove(hashed);
  } catch (e) {
    if (e instanceof EntityNotFoundError) {
      return { type: "RefreshTokenNotFound" };
    }
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return { type: "Success" };
}
