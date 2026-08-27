import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import { EntityNotFoundError } from "../../../shared/mod.ts";
import { Entity as TodoEntity } from "../../domain/entities/todo.ts";

type Deps = {
  repos: {
    todo: {
      remove(id: TodoEntity["id"]): Promise<void>;
    };
  };
};

type Input = {
  id: TodoEntity["id"];
};

type Output = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    deletedId: TodoEntity["id"];
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
