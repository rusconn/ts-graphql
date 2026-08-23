import type { Credential as Item } from "../../../../../shared/mod.ts";
import { entities } from "../../../../domain/entities/test/users.ts";
import { toDb } from "../../../repositories/user.ts";

export const items = {
  alice: toDb(entities.alice).credential,
  bob: toDb(entities.bob).credential,
} satisfies Record<string, Item>;
