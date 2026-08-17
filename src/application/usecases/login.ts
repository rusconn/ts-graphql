import type { EmptyObject } from "type-fest";

import { RefreshToken, User } from "../../domain/entities.ts";
import type { IUserRepoForAdmin } from "../../domain/repositories/user/for-admin.ts";
import type { IUserRepoForGuest } from "../../domain/repositories/user/for-guest.ts";
import type { IUserRepoForUser } from "../../domain/repositories/user/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as AccessToken from "../session/access-token.ts";
import type { IUnitOfWorkForAdmin } from "../unit-of-works/for-admin.ts";
import type { IUnitOfWorkForGuest } from "../unit-of-works/for-guest.ts";
import type { IUnitOfWorkForUser } from "../unit-of-works/for-user.ts";

type LoginContext = {
  repos: {
    user:
      | IUserRepoForGuest //
      | IUserRepoForUser
      | IUserRepoForAdmin;
  };
  unitOfWork:
    | IUnitOfWorkForGuest //
    | IUnitOfWorkForUser
    | IUnitOfWorkForAdmin;
};

type LoginInput = {
  email: User.Email.Type;
  password: User.Password.Type;
};

type LoginResult = DiscriminatedUnion<{
  UserNotFound: EmptyObject;
  IncorrectPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    accessToken: string;
    rawRefreshToken: RefreshToken.Token.Type;
  };
}>;

export async function login(ctx: LoginContext, input: LoginInput): Promise<LoginResult> {
  const { email, password } = input;

  const user = await ctx.repos.user.findByEmail(email);
  if (!user) {
    return { type: "UserNotFound" };
  }

  const match = await User.authenticate(user, password);
  if (!match) {
    return { type: "IncorrectPassword" };
  }

  const { rawRefreshToken, refreshToken } = await RefreshToken.create(user.id);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.refreshToken.add(refreshToken);
      await repos.refreshToken.retainLatest(user.id, RefreshToken.MAX_RETENTION);
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
