import type { EmptyObject } from "type-fest";

import * as Entities from "../../domain/entities.ts";
import type { IUserRepoForAdmin } from "../../domain/repositories/user/for-admin.ts";
import type { IUserRepoForUser } from "../../domain/repositories/user/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { IUnitOfWorkForAdmin } from "../unit-of-works/for-admin.ts";
import type { IUnitOfWorkForUser } from "../unit-of-works/for-user.ts";

type DeleteAccountContext = {
  user: { id: Entities.User.Type["id"] };
  repos: { user: IUserRepoForUser | IUserRepoForAdmin };
  unitOfWork: IUnitOfWorkForUser | IUnitOfWorkForAdmin;
};

type DeleteAccountResult = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  IncorrectPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: EmptyObject;
}>;

export async function deleteAccount(
  ctx: DeleteAccountContext,
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
