import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { IUserRepoForAdmin } from "../../domain/repositories/user/for-admin.ts";
import type { IUserRepoForUser } from "../../domain/repositories/user/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";

type UpdateAccountContext = {
  user: { id: User.Type["id"] };
  repos: { user: IUserRepoForUser | IUserRepoForAdmin };
};

type UpdateAccountInput = {
  name?: User.Name.Type;
};

type UpdateAccountResult = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    updated: Dtos.User.Type;
  };
}>;

export async function updateAccount(
  ctx: UpdateAccountContext,
  input: UpdateAccountInput,
): Promise<UpdateAccountResult> {
  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "AccountNotFound" };
  }

  const updatedUser = User.updateAccount(user, input);
  try {
    await ctx.repos.user.update(updatedUser);
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    updated: Dtos.User.fromEntity(updatedUser),
  };
}
