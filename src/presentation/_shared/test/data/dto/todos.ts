import { toDto } from "../../../../../infrastructure/queries/todo.ts";
import { db as todos } from "../db/todos.ts";

export const dto = {
  admin1: toDto(todos.admin1),
  alice1: toDto(todos.alice1),
  alice2: toDto(todos.alice2),
  alice3: toDto(todos.alice3),
};
