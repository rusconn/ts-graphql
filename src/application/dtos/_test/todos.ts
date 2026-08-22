import { entities } from "../../../domain/entities/_test/todos.ts";
import { fromEntity } from "../todo.ts";

export const dtos = {
  alice1: fromEntity(entities.alice1),
  alice2: fromEntity(entities.alice2),
  alice3: fromEntity(entities.alice3),
  bob1: fromEntity(entities.bob1),
};
