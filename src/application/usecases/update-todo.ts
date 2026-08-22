import type { EmptyObject } from "type-fest";

import * as TodoEntity from "../../domain/entities/todo.ts";
import type { ITodoRepoForAuthed } from "../../domain/repositories/todo/for-authed.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as TodoDto from "../dtos/todo.ts";

type Deps = {
  repos: { todo: ITodoRepoForAuthed };
};

type Input = {
  id: TodoEntity.Id.Type;
  title?: TodoEntity.Title.Type;
  description?: TodoEntity.Description.Type;
  status?: TodoEntity.Status.Type;
};

type Output = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    updated: TodoDto.Type;
  };
}>;

export async function updateTodo(deps: Deps, { id, ...input }: Input): Promise<Output> {
  const todo = await deps.repos.todo.find(id);
  if (!todo) {
    return { type: "TodoNotFound" };
  }

  const updatedTodo = TodoEntity.update(todo, input);
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
    updated: TodoDto.fromEntity(updatedTodo),
  };
}
