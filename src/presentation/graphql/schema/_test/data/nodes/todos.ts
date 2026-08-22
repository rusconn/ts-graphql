import type { OverrideProperties } from "type-fest";

import * as Entities from "../../../../../../domain/entities.ts";
import { entities } from "../../../../../_shared/test/data/entities/todos.ts";
import * as Graph from "../../../_types.ts";
import { toTodoId } from "../../../Todo/id.ts";
import { type DateTimeISO, dateTimeISO } from "./_shared.ts";

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

function node(todo: Entities.Todo.Type): GraphTodo {
  return {
    __typename: "Todo",
    id: toTodoId(todo.id),
    title: todo.title,
    description: todo.description,
    status: statusMap[todo.status],
    createdAt: dateTimeISO(todo.createdAt),
    updatedAt: dateTimeISO(todo.updatedAt),
  };
}

const statusMap: Record<Entities.Todo.Status.Type, GraphTodo["status"]> = {
  [Entities.Todo.Status.DONE]: Graph.TodoStatus.Done,
  [Entities.Todo.Status.PENDING]: Graph.TodoStatus.Pending,
};

export const nodes = {
  alice1: node(entities.alice1),
  alice2: node(entities.alice2),
  alice3: node(entities.alice3),
  bob1: node(entities.bob1),
};

export function dummyId() {
  return toTodoId(Entities.Todo.Id.create());
}
