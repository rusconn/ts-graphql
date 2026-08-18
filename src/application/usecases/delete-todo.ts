import type { EmptyObject } from "type-fest";

import type { Todo } from "../../domain/entities.ts";
import { EntityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { ITodoRepoForAdmin } from "../../domain/repositories/todo/for-admin.ts";
import type { ITodoRepoForUser } from "../../domain/repositories/todo/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";

type Deps = {
  repos: { todo: ITodoRepoForUser | ITodoRepoForAdmin };
};

type Input = {
  id: Todo.Id.Type;
};

type Output = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    deletedId: Todo.Id.Type;
  };
}>;

export async function deleteTodo(deps: Deps, input: Input): Promise<Output> {
  try {
    await deps.repos.todo.remove(input.id);
  } catch (e) {
    if (e instanceof EntityNotFoundError) {
      return { type: "TodoNotFound" };
    }
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    deletedId: input.id,
  };
}
