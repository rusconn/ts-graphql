import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import { EntityNotFoundError } from "../../../shared/mod.ts";
import { Entity as RefreshTokenEntity } from "../../domain/entities/refresh-token.ts";

type Deps = {
  repos: {
    refreshToken: {
      remove(token: RefreshTokenEntity["token"]): Promise<void>;
    };
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
