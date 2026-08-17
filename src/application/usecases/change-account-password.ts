import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { IUserRepoForAdmin } from "../../domain/repositories/user/for-admin.ts";
import type { IUserRepoForUser } from "../../domain/repositories/user/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";

type ChangeAccountPasswordContext = {
  user: { id: User.Type["id"] };
  repos: { user: IUserRepoForUser | IUserRepoForAdmin };
};

type ChangeAccountPasswordInput = {
  oldPassword: User.Password.Type;
  newPassword: User.Password.Type;
};

type ChangeAccountPasswordResult = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  NewPasswordSameAsOld: EmptyObject;
  IncorrectOldPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: Dtos.User.Type;
  };
}>;

export async function changeAccountPassword(
  ctx: ChangeAccountPasswordContext,
  input: ChangeAccountPasswordInput,
): Promise<ChangeAccountPasswordResult> {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "AccountNotFound" };
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
