import type { EmptyObject } from "type-fest";

import * as Entities from "../../domain/entities.ts";
import type { IUserRepoForAdmin } from "../../domain/repositories/user/for-admin.ts";
import type { IUserRepoForUser } from "../../domain/repositories/user/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { IUnitOfWorkForAdmin } from "../unit-of-works/for-admin.ts";
import type { IUnitOfWorkForUser } from "../unit-of-works/for-user.ts";

type Deps = {
  repos: { user: IUserRepoForUser | IUserRepoForAdmin };
  unitOfWork: IUnitOfWorkForUser | IUnitOfWorkForAdmin;
};

type Input = {
  userId: Entities.User.Type["id"];
  password: Entities.User.Password.Type;
};

type Output = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  IncorrectPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: EmptyObject;
}>;

export async function deleteAccount(deps: Deps, input: Input): Promise<Output> {
  const user = await deps.repos.user.find(input.userId);
  if (!user) {
    return { type: "AccountNotFound" };
  }
  if (!(await Entities.User.authenticate(user, input.password))) {
    return { type: "IncorrectPassword" };
  }

  try {
    await deps.unitOfWork.run(async (repos) => {
      await repos.todo.removeByUserId(input.userId);
      await repos.refreshToken.removeByUserId(input.userId);
      await repos.user.remove(input.userId);
    });
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return { type: "Success" };
}
