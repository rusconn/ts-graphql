import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import { Dto as TodoDto } from "../../application/dtos/todo.ts";
import { Entity as TodoEntity } from "../../domain/entities/todo.ts";

type Deps = {
  repos: {
    todo: {
      find(id: TodoEntity["id"]): Promise<TodoEntity | undefined>;
      update(todo: TodoEntity): Promise<void>;
    };
  };
};

type Input = {
  id: TodoEntity["id"];
  title?: TodoEntity["title"];
  description?: TodoEntity["description"];
  status?: TodoEntity["status"];
};

type Output = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    updated: TodoDto;
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
