import { entities } from "../../../../domain/entities/_test/users.ts";
import { toDb } from "../../../repositories/user.ts";
import type { Credential as Item } from "../types.ts";

export const items = {
  alice: toDb(entities.alice).credential,
  bob: toDb(entities.bob).credential,
} satisfies Record<string, Item>;
