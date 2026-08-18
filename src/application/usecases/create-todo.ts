import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { ITodoRepoForAuthed } from "../../domain/repositories/todo/for-authed.ts";
import type { IUserRepoForAuthed } from "../../domain/repositories/user/for-authed.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";

type Deps = {
  repos: {
    todo: ITodoRepoForAuthed;
    user: IUserRepoForAuthed;
  };
};

type Input = {
  userId: Todo.Type["userId"];
  title: Todo.Title.Type;
  description: Todo.Description.Type;
};

type Output = DiscriminatedUnion<{
  TodoCountLimitExceeded: {
    limit: number;
  };
  UserNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    created: Dtos.Todo.Type;
  };
}>;

export async function createTodo(deps: Deps, input: Input): Promise<Output> {
  const count = await deps.repos.todo.count();
  if (count >= Todo.MAX_COUNT) {
    return {
      type: "TodoCountLimitExceeded",
      limit: Todo.MAX_COUNT,
    };
  }

  const user = await deps.repos.user.find(input.userId);
  if (!user) {
    return { type: "UserNotFound" };
  }

  const todo = Todo.create(user.id, input);
  try {
    await deps.repos.todo.add(todo);
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    created: Dtos.Todo.fromEntity(todo),
  };
}

if (import.meta.vitest) {
  const args = {
    userId: "dummy",
    title: "dummy",
    description: "dummy",
  } as Input;

  describe("maximum count of todos", () => {
    const createRepos = (num: number) => ({
      todo: {
        count: async () => num,
      },
      user: {
        find: async () => ({ id: "dummy" }),
      },
    });

    const notExceededs = [0, 1, Todo.MAX_COUNT - 1];
    const exceededs = [Todo.MAX_COUNT, Todo.MAX_COUNT + 1];

    it.each(notExceededs)("not exceededs: %#", async (num) => {
      const repos = createRepos(num);
      const result = await createTodo({ repos } as unknown as Deps, args);
      expect(result?.type).not.toBe("TodoCountLimitExceeded");
    });

    it.each(exceededs)("exceededs: %#", async (num) => {
      const repos = createRepos(num);
      const result = await createTodo({ repos } as unknown as Deps, args);
      expect(result?.type).toBe("TodoCountLimitExceeded");
    });
  });
}
