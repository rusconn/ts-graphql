import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import {
  UserEntity,
  type IUserRepoForAuthed,
  type IUserRepoForGuest,
  type UserPassword,
} from "../../../user/mod.ts";
import {
  Entity as RefreshTokenEntity,
  type RefreshToken,
} from "../../domain/entities/refresh-token.ts";
import type { IRefreshTokenRepoForAuthed } from "../../domain/repositories/refresh-token/for-authed.ts";
import type { IRefreshTokenRepoForGuest } from "../../domain/repositories/refresh-token/for-guest.ts";
import * as AccessToken from "../access-token.ts";

type Deps = {
  repos: {
    user:
      | IUserRepoForGuest //
      | IUserRepoForAuthed;
  };
  unitOfWork: {
    run<T>(
      work: (repos: {
        refreshToken:
          | IRefreshTokenRepoForGuest //
          | IRefreshTokenRepoForAuthed;
      }) => Promise<T>,
    ): Promise<T>;
  };
};

type Input = {
  email: UserEntity["email"];
  password: UserPassword;
};

type Output = DiscriminatedUnion<{
  UserNotFound: EmptyObject;
  IncorrectPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    accessToken: string;
    rawRefreshToken: RefreshToken;
  };
}>;

export async function login(deps: Deps, input: Input): Promise<Output> {
  const { email, password } = input;

  const user = await deps.repos.user.findByEmail(email);
  if (!user) {
    return { type: "UserNotFound" };
  }

  const match = await UserEntity.authenticate(user, password);
  if (!match) {
    return { type: "IncorrectPassword" };
  }

  const { rawRefreshToken, refreshToken } = await RefreshTokenEntity.create(user.id);
  try {
    await deps.unitOfWork.run(async (repos) => {
      await repos.refreshToken.add(refreshToken);
      await repos.refreshToken.retainLatest(user.id, RefreshTokenEntity.MAX_RETENTION);
    });
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    accessToken: await AccessToken.sign({ id: user.id }),
    rawRefreshToken,
  };
}
