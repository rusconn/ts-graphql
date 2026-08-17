import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { ITodoRepoForAdmin } from "../../domain/repositories/todo/for-admin.ts";
import type { ITodoRepoForUser } from "../../domain/repositories/todo/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";

type ChangeTodoStatusContext = {
  repos: { todo: ITodoRepoForUser | ITodoRepoForAdmin };
};

type ChangeTodoStatusInput = {
  id: Todo.Id.Type;
  status: Todo.Status.Type;
};

type ChangeTodoStatusResult = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: Dtos.Todo.Type;
  };
}>;

export async function changeTodoStatus(
  ctx: ChangeTodoStatusContext,
  { id, status }: ChangeTodoStatusInput,
): Promise<ChangeTodoStatusResult> {
  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return { type: "TodoNotFound" };
  }

  const changedTodo = Todo.changeStatus(todo, status);
  try {
    await ctx.repos.todo.update(changedTodo);
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    changed: Dtos.Todo.fromEntity(changedTodo),
  };
}
