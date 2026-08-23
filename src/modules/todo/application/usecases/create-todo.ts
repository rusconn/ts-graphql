import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import { Dto as TodoDto } from "../../application/dtos/todo.ts";
import { UserNotFoundError, userNotFoundError } from "../../application/errors/user-not-found.ts";
import { Entity as TodoEntity } from "../../domain/entities/todo.ts";
import type { ITodoRepoForAuthed } from "../../domain/repositories/todo/for-authed.ts";

type Deps = {
  repos: {
    todo: ITodoRepoForAuthed;
  };
};

type Input = {
  userId: TodoEntity["userId"];
  title: TodoEntity["title"];
  description: TodoEntity["description"];
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
    created: TodoDto;
  };
}>;

export async function createTodo(deps: Deps, input: Input): Promise<Output> {
  // TOCTOUによる件数超過は許容する
  const count = await deps.repos.todo.count();
  if (count >= TodoEntity.MAX_COUNT) {
    return {
      type: "TodoCountLimitExceeded",
      limit: TodoEntity.MAX_COUNT,
    };
  }

  const todo = TodoEntity.create(input);
  try {
    await deps.repos.todo.add(todo);
  } catch (e) {
    if (e instanceof UserNotFoundError) {
      return { type: "UserNotFound" };
    }
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    created: TodoDto.fromEntity(todo),
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
    });

    const notExceededs = [0, 1, TodoEntity.MAX_COUNT - 1];
    const exceededs = [TodoEntity.MAX_COUNT, TodoEntity.MAX_COUNT + 1];

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

  describe("when adding todo fails", () => {
    const createReposWithAdd = (add: () => Promise<void>) => ({
      todo: {
        count: async () => 0,
        add,
      },
    });

    it("returns UserNotFound when UserNotFoundError is thrown", async () => {
      const repos = createReposWithAdd(async () => {
        throw userNotFoundError();
      });
      const result = await createTodo({ repos } as unknown as Deps, args);
      expect(result?.type).toBe("UserNotFound");
    });

    it("returns UnexpectedFailure for other errors", async () => {
      const cause = new Error("boom");
      const repos = createReposWithAdd(async () => {
        throw cause;
      });
      const result = await createTodo({ repos } as unknown as Deps, args);
      expect(result?.type).toBe("UnexpectedFailure");
      if (result?.type === "UnexpectedFailure") {
        expect(result.cause).toBe(cause);
      }
    });
  });
}
