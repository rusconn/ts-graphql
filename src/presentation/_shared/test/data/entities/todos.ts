import * as TodoRepo from "../../../../../infrastructure/repositories/todo.ts";
import { items as todos } from "../items/todos.ts";

export const entities = {
  alice1: TodoRepo.toEntity(todos.alice1),
  alice2: TodoRepo.toEntity(todos.alice2),
  alice3: TodoRepo.toEntity(todos.alice3),
  bob1: TodoRepo.toEntity(todos.bob1),
};
