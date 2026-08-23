import type { Todo as Item } from "../../../../../shared/mod.ts";
import { entities } from "../../../../domain/entities/test/todos.ts";
import { toDb } from "../../../repositories/todo.ts";

export const items = {
  alice1: toDb(entities.alice1),
  alice2: toDb(entities.alice2),
  alice3: toDb(entities.alice3),
  bob1: toDb(entities.bob1),
} satisfies Record<string, Item>;
