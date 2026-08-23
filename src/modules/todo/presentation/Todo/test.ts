import type { OverrideProperties } from "type-fest";

import type { DateTimeISO } from "../../../shared/mod.ts";
import { entities } from "../../domain/entities/test/todos.ts";
import { Entity } from "../../domain/entities/todo.ts";
import { TodoStatus } from "../TodoStatus.ts";
import type { Todo as GraphTodoBase } from "../types.generated.ts";
import { toTodoId } from "./id.ts";

type GraphTodo = OverrideProperties<
  Required<
    Pick<
      GraphTodoBase,
      | "id" //
      | "title"
      | "description"
      | "status"
      | "createdAt"
      | "updatedAt"
    >
  > & { __typename: "Todo" },
  {
    createdAt: DateTimeISO;
    updatedAt: DateTimeISO;
  }
>;

function node(todo: Entity): GraphTodo {
  return {
    __typename: "Todo",
    id: toTodoId(todo.id),
    title: todo.title,
    description: todo.description,
    status: statusMap[todo.status],
    createdAt: todo.createdAt.toISOString() as DateTimeISO,
    updatedAt: todo.updatedAt.toISOString() as DateTimeISO,
  };
}

const statusMap: Record<Entity["status"], GraphTodo["status"]> = {
  [Entity.Status.DONE]: TodoStatus.Done,
  [Entity.Status.PENDING]: TodoStatus.Pending,
};

export const nodes = {
  alice1: node(entities.alice1),
  alice2: node(entities.alice2),
  alice3: node(entities.alice3),
  bob1: node(entities.bob1),
};

export function dummyId() {
  return toTodoId(Entity.Id.create());
}
