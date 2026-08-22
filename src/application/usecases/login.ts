import type { EmptyObject } from "type-fest";

import * as RefreshTokenEntity from "../../domain/entities/refresh-token.ts";
import * as UserEntity from "../../domain/entities/user.ts";
import type { IUserRepoForAuthed } from "../../domain/repositories/user/for-authed.ts";
import type { IUserRepoForGuest } from "../../domain/repositories/user/for-guest.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as AccessToken from "../session/access-token.ts";
import type { IUnitOfWorkForAuthed } from "../unit-of-works/for-authed.ts";
import type { IUnitOfWorkForGuest } from "../unit-of-works/for-guest.ts";

type Deps = {
  repos: {
    user:
      | IUserRepoForGuest //
      | IUserRepoForAuthed;
  };
  unitOfWork:
    | IUnitOfWorkForGuest //
    | IUnitOfWorkForAuthed;
};

type Input = {
  email: UserEntity.Email.Type;
  password: UserEntity.Password.Type;
};

type Output = DiscriminatedUnion<{
  UserNotFound: EmptyObject;
  IncorrectPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    accessToken: string;
    rawRefreshToken: RefreshTokenEntity.Token.Type;
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
