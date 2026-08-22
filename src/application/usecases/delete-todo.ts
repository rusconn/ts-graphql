import type { EmptyObject } from "type-fest";

import type * as TodoEntity from "../../domain/entities/todo.ts";
import { EntityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { ITodoRepoForAuthed } from "../../domain/repositories/todo/for-authed.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";

type Deps = {
  repos: { todo: ITodoRepoForAuthed };
};

type Input = {
  id: TodoEntity.Id.Type;
};

type Output = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    deletedId: TodoEntity.Id.Type;
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
