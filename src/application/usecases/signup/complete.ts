import type { EmptyObject } from "type-fest";

import * as RefreshTokenEntity from "../../../domain/entities/refresh-token.ts";
import * as UserEntity from "../../../domain/entities/user.ts";
import type { DiscriminatedUnion } from "../../../lib/type.ts";
import { EmailAlreadyExistsError } from "../../errors/email-already-exists.ts";
import * as AccessToken from "../../session/access-token.ts";
import type { IUnitOfWorkForGuest } from "../../unit-of-works/for-guest.ts";
import * as EmailVerification from "./_email-verification.ts";

type Deps = {
  unitOfWork: IUnitOfWorkForGuest;
};

type Input = {
  token: string;
  name: UserEntity.Name.Type;
  password: UserEntity.Password.Type;
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
    rawRefreshToken: RefreshTokenEntity.Token.Type;
  };
}>;

export async function completeSignup(deps: Deps, input: Input): Promise<Output> {
  const { token, name, password } = input;

  const verified = await EmailVerification.verify(token);
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
