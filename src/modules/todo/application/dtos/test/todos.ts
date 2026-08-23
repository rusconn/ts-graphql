import { entities } from "../../../domain/entities/test/todos.ts";
import { Dto } from "../todo.ts";

export const dtos = {
  alice1: Dto.fromEntity(entities.alice1),
  alice2: Dto.fromEntity(entities.alice2),
  alice3: Dto.fromEntity(entities.alice3),
  bob1: Dto.fromEntity(entities.bob1),
};
