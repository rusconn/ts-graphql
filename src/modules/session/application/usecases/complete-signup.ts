import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import {
  EmailAlreadyExistsError,
  SignupEmailVerification,
  UserEntity,
  type IUserRepoForGuest,
  type UserPassword,
} from "../../../user/mod.ts";
import {
  Entity as RefreshTokenEntity,
  type RefreshToken,
} from "../../domain/entities/refresh-token.ts";
import type { IRefreshTokenRepoForGuest } from "../../domain/repositories/refresh-token/for-guest.ts";
import * as AccessToken from "../access-token.ts";

type Deps = {
  unitOfWork: {
    run<T>(
      work: (repos: {
        user: Pick<IUserRepoForGuest, "add">;
        refreshToken: Pick<IRefreshTokenRepoForGuest, "add">;
      }) => Promise<T>,
    ): Promise<T>;
  };
};

type Input = {
  token: string;
  name: UserEntity["name"];
  password: UserPassword;
};

type Output = DiscriminatedUnion<{
  EmailAlreadyTaken: EmptyObject;
  InvalidVerificationToken: EmptyObject;
  ExpiredVerificationToken: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    accessToken: string;
    rawRefreshToken: RefreshToken;
  };
}>;

export async function completeSignup(deps: Deps, input: Input): Promise<Output> {
  const { token, name, password } = input;

  const verified = await SignupEmailVerification.verify(token);
  switch (verified.type) {
    case "Success":
      break;
    case "Invalid":
      return { type: "InvalidVerificationToken" };
    case "Expired":
      return { type: "ExpiredVerificationToken" };
    case "Unknown":
      return { type: "UnexpectedFailure", cause: verified.error };
    default:
      throw new Error(verified satisfies never);
  }

  const user = await UserEntity.create({ name, email: verified.email, password });
  const { rawRefreshToken, refreshToken } = await RefreshTokenEntity.create(user.id);
  try {
    await deps.unitOfWork.run(async (repos) => {
      await repos.user.add(user);
      await repos.refreshToken.add(refreshToken);
    });
  } catch (e) {
    if (e instanceof EmailAlreadyExistsError) {
      return { type: "EmailAlreadyTaken" };
    }
    return { type: "UnexpectedFailure", cause: e };
  }

  return {
    type: "Success",
    accessToken: await AccessToken.sign({ id: user.id }),
    rawRefreshToken,
  };
}
