import type { OverrideProperties } from "type-fest";

import { entities } from "../../../../domain/entities/_test/todos.ts";
import * as Entity from "../../../../domain/entities/todo.ts";
import * as Graph from "../_types.ts";
import type { DateTimeISO } from "../DateTimeISO.ts";
import { toTodoId } from "./id.ts";

type GraphTodo = OverrideProperties<
  Required<
    Pick<
      Graph.Todo,
      | "__typename" //
      | "id"
      | "title"
      | "description"
      | "status"
      | "createdAt"
      | "updatedAt"
    >
  >,
  {
    createdAt: DateTimeISO;
    updatedAt: DateTimeISO;
  }
>;

function node(todo: Entity.Type): GraphTodo {
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

const statusMap: Record<Entity.Status.Type, GraphTodo["status"]> = {
  [Entity.Status.DONE]: Graph.TodoStatus.Done,
  [Entity.Status.PENDING]: Graph.TodoStatus.Pending,
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

export * from "../../../../domain/entities/_test/todos.ts";
export * from "../../../../application/dtos/_test/todos.ts";
