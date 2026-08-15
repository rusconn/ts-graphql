import { toDto } from "../../../../../infrastructure/queries/todo.ts";
import { items as todos } from "../items/todos.ts";

export const dtos = {
  admin1: toDto(todos.admin1),
  alice1: toDto(todos.alice1),
  alice2: toDto(todos.alice2),
  alice3: toDto(todos.alice3),
};
