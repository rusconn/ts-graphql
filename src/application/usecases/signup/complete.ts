import type { EmptyObject } from "type-fest";

import { RefreshToken, User } from "../../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../../lib/type.ts";
import type { AppContextForGuest } from "../../contexts.ts";
import * as Dtos from "../../dtos.ts";
import { EmailAlreadyExistsError } from "../../errors/email-already-exists.ts";
import * as EmailVerification from "./_email-verification.ts";

type CompleteSignupInput = {
  token: string;
  name: User.Name.Type;
  password: User.Password.Type;
};

type CompleteSignupResult = DiscriminatedUnion<{
  EmailAlreadyTaken: EmptyObject;
  InvalidVerificationToken: EmptyObject;
  ExpiredVerificationToken: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    rawRefreshToken: RefreshToken.Token.Type;
    refreshToken: Dtos.RefreshToken.Type;
  };
}>;

export async function completeSignup(
  ctx: AppContextForGuest,
  input: CompleteSignupInput,
): Promise<CompleteSignupResult> {
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

  const user = await User.create({ name, email: verified.email, password });
  const { rawRefreshToken, refreshToken } = await RefreshToken.create(user.id);
  try {
    await ctx.unitOfWork.run(async (repos) => {
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
    rawRefreshToken,
    refreshToken: Dtos.RefreshToken.fromEntity(refreshToken),
  };
}
