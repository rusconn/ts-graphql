import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { IUserRepoForAdmin } from "../../domain/repositories/user/for-admin.ts";
import type { IUserRepoForUser } from "../../domain/repositories/user/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.ts";

type ChangeAccountEmailContext = {
  user: { id: User.Type["id"] };
  repos: { user: IUserRepoForUser | IUserRepoForAdmin };
};

type ChangeAccountEmailResult = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  EmailAlreadyTaken: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: Dtos.User.Type;
  };
}>;

export async function changeAccountEmail(
  ctx: ChangeAccountEmailContext,
  email: User.Email.Type,
): Promise<ChangeAccountEmailResult> {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "AccountNotFound" };
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
