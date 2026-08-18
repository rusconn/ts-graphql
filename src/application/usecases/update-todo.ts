import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { ITodoRepoForAuthed } from "../../domain/repositories/todo/for-authed.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";

type Deps = {
  repos: { todo: ITodoRepoForAuthed };
};

type Input = {
  id: Todo.Id.Type;
  title?: Todo.Title.Type;
  description?: Todo.Description.Type;
  status?: Todo.Status.Type;
};

type Output = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    updated: Dtos.Todo.Type;
  };
}>;

export async function updateTodo(deps: Deps, { id, ...input }: Input): Promise<Output> {
  const todo = await deps.repos.todo.find(id);
  if (!todo) {
    return { type: "TodoNotFound" };
  }

  const updatedTodo = Todo.update(todo, input);
  try {
    await deps.repos.todo.update(updatedTodo);
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
