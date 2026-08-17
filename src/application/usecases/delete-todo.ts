import type { EmptyObject } from "type-fest";

import type { Todo } from "../../domain/entities.ts";
import { EntityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { ITodoRepoForAdmin } from "../../domain/repositories/todo/for-admin.ts";
import type { ITodoRepoForUser } from "../../domain/repositories/todo/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";

type DeleteTodoContext = {
  repos: { todo: ITodoRepoForUser | ITodoRepoForAdmin };
};

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
  ctx: DeleteTodoContext,
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
