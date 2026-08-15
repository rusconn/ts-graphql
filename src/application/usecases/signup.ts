import type { EmptyObject } from "type-fest";

import { RefreshToken, User } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { AppContextForGuest } from "../contexts.ts";
import * as Dtos from "../dtos.ts";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.ts";

type SignupInput = {
  name: User.Name.Type;
  email: User.Email.Type;
  password: User.Password.Type;
};

type SignupResult = DiscriminatedUnion<{
  EmailAlreadyTaken: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    rawRefreshToken: RefreshToken.Token.Type;
    refreshToken: Dtos.RefreshToken.Type;
  };
}>;

export async function signup(ctx: AppContextForGuest, input: SignupInput): Promise<SignupResult> {
  const user = await User.create(input);
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
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    rawRefreshToken,
    refreshToken: Dtos.RefreshToken.fromEntity(refreshToken),
  };
}
