import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { AppContextForAuthed } from "../contexts.ts";
import * as Dtos from "../dtos.ts";

type UpdateAccountInput = {
  name?: User.Name.Type;
};

type UpdateAccountResult = DiscriminatedUnion<{
  UserEntityNotFound: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    updated: Dtos.User.Type;
  };
}>;

export async function updateAccount(
  ctx: AppContextForAuthed,
  input: UpdateAccountInput,
): Promise<UpdateAccountResult> {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "UserEntityNotFound" };
  }

  const updatedUser = User.updateAccount(user, input);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.user.update(updatedUser);
    });
  } catch (e) {
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    updated: Dtos.User.fromEntity(updatedUser),
  };
}
