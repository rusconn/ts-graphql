import type { EmptyObject } from "type-fest";

import * as RefreshTokenEntity from "../../domain/entities/refresh-token.ts";
import { EntityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { IRefreshTokenRepoForAuthed } from "../../domain/repositories/refresh-token/for-authed.ts";
import type { IRefreshTokenRepoForGuest } from "../../domain/repositories/refresh-token/for-guest.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";

type Deps = {
  repos: {
    refreshToken:
      | IRefreshTokenRepoForGuest //
      | IRefreshTokenRepoForAuthed;
  };
};

type Input = {
  refreshToken: string;
};

type Output = DiscriminatedUnion<{
  InvalidRefreshToken: EmptyObject;
  RefreshTokenNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: EmptyObject;
}>;

export async function logout(deps: Deps, input: Input): Promise<Output> {
  if (!RefreshTokenEntity.Token.is(input.refreshToken)) {
    return { type: "InvalidRefreshToken" };
  }

  const hashed = await RefreshTokenEntity.Token.hash(input.refreshToken);
  try {
    await deps.repos.refreshToken.remove(hashed);
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
