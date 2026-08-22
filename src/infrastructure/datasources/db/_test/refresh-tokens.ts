import { entities } from "../../../../domain/entities/_test/refresh-tokens.ts";
import { toDb } from "../../../repositories/refresh-token.ts";
import type { RefreshToken as Item } from "../types.ts";

export const items = {
  alice: toDb(entities.alice),
  bob: toDb(entities.bob),
} satisfies Record<string, Item>;
