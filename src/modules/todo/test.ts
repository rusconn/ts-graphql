export { TodoQuery } from "./infrastructure/queries/test/todo.ts";
export { TodoRepo } from "./infrastructure/repositories/todo.ts";

import { dtos } from "./application/dtos/test/todos.ts";
import { entities, seed } from "./domain/entities/test/todos.ts";
import { dummyId, nodes } from "./presentation/Todo/test.ts";

export const todos = {
  dtos,
  entities,
  seed,
  dummyId,
  nodes,
};
