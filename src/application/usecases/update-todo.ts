import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import type { AppContextForAuthed } from "../contexts.ts";
import * as Dtos from "../dtos.ts";

type UpdateTodoInput = {
  id: Todo.Id.Type;
  title?: Todo.Title.Type;
  description?: Todo.Description.Type;
  status?: Todo.Status.Type;
};

type UpdateTodoResult = DiscriminatedUnion<{
  ResourceNotFound: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    updated: Dtos.Todo.Type;
  };
}>;

export async function updateTodo(
  ctx: AppContextForAuthed,
  { id, ...input }: UpdateTodoInput,
): Promise<UpdateTodoResult> {
  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return { type: "ResourceNotFound" };
  }

  const updatedTodo = Todo.update(todo, input);
  try {
    await ctx.repos.todo.update(updatedTodo);
  } catch (e) {
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    updated: Dtos.Todo.fromEntity(updatedTodo),
  };
}
