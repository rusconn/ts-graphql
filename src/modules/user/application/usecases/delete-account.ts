import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import { Entity, type UserPassword } from "../../domain/entities/user.ts";

type Deps = {
  repos: {
    user: {
      find(id: Entity["id"]): Promise<Entity | undefined>;
      remove(id: Entity["id"]): Promise<void>;
    };
  };
  unitOfWork: {
    run<T>(
      work: (repos: {
        todo: {
          removeByUserId(userId: Entity["id"]): Promise<void>;
        };
        refreshToken: {
          removeByUserId(userId: Entity["id"]): Promise<void>;
        };
        user: {
          remove(id: Entity["id"]): Promise<void>;
        };
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
