import { entities } from "../../../../domain/entities/_test/users.ts";
import { toDb } from "../../../repositories/user.ts";
import type { User as Item } from "../types.ts";

export const items = {
  alice: toDb(entities.alice).user,
  bob: toDb(entities.bob).user,
} satisfies Record<string, Item>;
