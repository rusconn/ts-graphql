import * as TodoRepo from "../../../../../infrastructure/repositories/todo.ts";
import { items as todos } from "../items/todos.ts";

export const entities = {
  admin1: TodoRepo.toEntity(todos.admin1),
  alice1: TodoRepo.toEntity(todos.alice1),
  alice2: TodoRepo.toEntity(todos.alice2),
  alice3: TodoRepo.toEntity(todos.alice3),
};
