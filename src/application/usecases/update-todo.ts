import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { ITodoRepoForAdmin } from "../../domain/repositories/todo/for-admin.ts";
import type { ITodoRepoForUser } from "../../domain/repositories/todo/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";

type UpdateTodoContext = {
  repos: { todo: ITodoRepoForUser | ITodoRepoForAdmin };
};

type UpdateTodoInput = {
  id: Todo.Id.Type;
  title?: Todo.Title.Type;
  description?: Todo.Description.Type;
  status?: Todo.Status.Type;
};

type UpdateTodoResult = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    updated: Dtos.Todo.Type;
  };
}>;

export async function updateTodo(
  ctx: UpdateTodoContext,
  { id, ...input }: UpdateTodoInput,
): Promise<UpdateTodoResult> {
  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return { type: "TodoNotFound" };
  }

  const updatedTodo = Todo.update(todo, input);
  try {
    await ctx.repos.todo.update(updatedTodo);
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    updated: Dtos.Todo.fromEntity(updatedTodo),
  };
}
