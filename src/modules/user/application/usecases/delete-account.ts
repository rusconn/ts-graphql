import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import { Entity, type UserPassword } from "../../domain/entities/user.ts";
import type { IUserRepoForAuthed } from "../../domain/repositories/user/for-authed.ts";

type Deps = {
  repos: { user: IUserRepoForAuthed };
  unitOfWork: {
    run<T>(
      work: (repos: {
        todo: {
          removeByUserId(userId: Entity["id"]): Promise<void>;
        };
        refreshToken: {
          removeByUserId(userId: Entity["id"]): Promise<void>;
        };
        user: IUserRepoForAuthed;
      }) => Promise<T>,
    ): Promise<T>;
  };
};

type Input = {
  userId: Entity["id"];
  password: UserPassword;
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
  if (!(await Entity.authenticate(user, input.password))) {
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
