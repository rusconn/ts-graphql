import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { AppContextForAuthed } from "../contexts.ts";
import * as Dtos from "../dtos.ts";

type ChangeLoginPasswordInput = {
  oldPassword: User.Password.Type;
  newPassword: User.Password.Type;
};

type ChangeLoginPasswordResult = DiscriminatedUnion<{
  UserNotFound: EmptyObject;
  NewPasswordSameAsOld: EmptyObject;
  IncorrectOldPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: Dtos.User.Type;
  };
}>;

export async function changeLoginPassword(
  ctx: AppContextForAuthed,
  input: ChangeLoginPasswordInput,
): Promise<ChangeLoginPasswordResult> {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "UserNotFound" };
  }

  const changedUser = await User.changePassword(user, input);
  if (changedUser.isErr()) {
    switch (changedUser.error) {
      case "NewPasswordSameAsOld":
        return { type: "NewPasswordSameAsOld" };
      case "IncorrectOldPassword":
        return { type: "IncorrectOldPassword" };
      default:
        throw new Error(changedUser.error satisfies never);
    }
  }

  try {
    await ctx.repos.user.update(changedUser.value);
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    changed: Dtos.User.fromEntity(changedUser.value),
  };
}
