import type { EmptyObject } from "type-fest";

import * as Entities from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { AppContextForAuthed } from "../contexts.ts";

type DeleteAccountResult = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  IncorrectPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: EmptyObject;
}>;

export async function deleteAccount(
  ctx: AppContextForAuthed,
  password: Entities.User.Password.Type,
): Promise<DeleteAccountResult> {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "AccountNotFound" };
  }
  if (!(await Entities.User.authenticate(user, password))) {
    return { type: "IncorrectPassword" };
  }

  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.removeByUserId(ctx.user.id);
      await repos.refreshToken.removeByUserId(ctx.user.id);
      await repos.user.remove(ctx.user.id);
    });
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return { type: "Success" };
}
