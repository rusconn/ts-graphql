import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { AppContextForAuthed } from "../contexts.ts";
import * as Dtos from "../dtos.ts";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.ts";

type ChangeUserEmailResult = DiscriminatedUnion<{
  UserNotFound: EmptyObject;
  EmailAlreadyTaken: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: Dtos.User.Type;
  };
}>;

export async function changeUserEmail(
  ctx: AppContextForAuthed,
  email: User.Email.Type,
): Promise<ChangeUserEmailResult> {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "UserNotFound" };
  }

  const changedUser = User.changeEmail(user, email);
  try {
    await ctx.repos.user.update(changedUser);
  } catch (e) {
    if (e instanceof EmailAlreadyExistsError) {
      return { type: "EmailAlreadyTaken" };
    }
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    changed: Dtos.User.fromEntity(changedUser),
  };
}
