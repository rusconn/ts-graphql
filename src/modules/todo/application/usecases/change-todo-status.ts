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
  status: TodoEntity["status"];
};

type Output = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: TodoDto;
  };
}>;

export async function changeTodoStatus(deps: Deps, input: Input): Promise<Output> {
  const { id, status } = input;

  const todo = await deps.repos.todo.find(id);
  if (!todo) {
    return { type: "TodoNotFound" };
  }

  const changedTodo = TodoEntity.changeStatus(todo, status);
  try {
    await deps.repos.todo.update(changedTodo);
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    changed: TodoDto.fromEntity(changedTodo),
  };
}
