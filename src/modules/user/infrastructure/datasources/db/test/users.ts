import type { User as Item } from "../../../../../shared/mod.ts";
import { entities } from "../../../../domain/entities/test/users.ts";
import { toDb } from "../../../repositories/user.ts";

export const items = {
  alice: toDb(entities.alice).user,
  bob: toDb(entities.bob).user,
} satisfies Record<string, Item>;
