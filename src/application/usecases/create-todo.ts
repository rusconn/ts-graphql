import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { ITodoRepoForAdmin } from "../../domain/repositories/todo/for-admin.ts";
import type { ITodoRepoForUser } from "../../domain/repositories/todo/for-user.ts";
import type { IUserRepoForAdmin } from "../../domain/repositories/user/for-admin.ts";
import type { IUserRepoForUser } from "../../domain/repositories/user/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";

type CreateTodoContext = {
  user: { id: Todo.Type["userId"] };
  repos: {
    todo: ITodoRepoForUser | ITodoRepoForAdmin;
    user: IUserRepoForUser | IUserRepoForAdmin;
  };
};

type CreateTodoInput = {
  title: Todo.Title.Type;
  description: Todo.Description.Type;
};

type CreateTodoResult = DiscriminatedUnion<{
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

export async function createTodo(
  ctx: CreateTodoContext,
  input: CreateTodoInput,
): Promise<CreateTodoResult> {
  const count = await ctx.repos.todo.count();
  if (count >= Todo.MAX_COUNT) {
    return {
      type: "TodoCountLimitExceeded",
      limit: Todo.MAX_COUNT,
    };
  }

  const user = await ctx.repos.user.find(ctx.user.id);
  if (!user) {
    return { type: "UserNotFound" };
  }

  const todo = Todo.create(user.id, input);
  try {
    await ctx.repos.todo.add(todo);
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
    title: "dummy",
    description: "dummy",
  } as CreateTodoInput;

  const user = { id: "dummy" };

  describe("maximum count of todos", () => {
    const createRepos = (num: number) => ({
      todo: {
        count: async () => num,
      },
      user: {
        find: async () => ({ id: "dummy" }),
      },
    });

    const unitOfWork = {
      run: async () => {},
    };

    const notExceededs = [0, 1, Todo.MAX_COUNT - 1];
    const exceededs = [Todo.MAX_COUNT, Todo.MAX_COUNT + 1];

    it.each(notExceededs)("not exceededs: %#", async (num) => {
      const repos = createRepos(num);
      const result = await createTodo(
        { user, repos, unitOfWork } as unknown as CreateTodoContext,
        args,
      );
      expect(result?.type).not.toBe("TodoCountLimitExceeded");
    });

    it.each(exceededs)("exceededs: %#", async (num) => {
      const repos = createRepos(num);
      const result = await createTodo(
        { user, repos, unitOfWork } as unknown as CreateTodoContext,
        args,
      );
      expect(result?.type).toBe("TodoCountLimitExceeded");
    });
  });
}
