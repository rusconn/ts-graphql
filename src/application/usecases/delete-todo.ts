import type { EmptyObject } from "type-fest";

import type { Todo } from "../../domain/entities.ts";
import { EntityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { AppContextForAuthed } from "../contexts.ts";

type DeleteTodoResult = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    deletedId: Todo.Id.Type;
  };
}>;

export async function deleteTodo(
  ctx: AppContextForAuthed,
  id: Todo.Id.Type,
): Promise<DeleteTodoResult> {
  try {
    await ctx.repos.todo.remove(id);
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
    deletedId: id,
  };
}
