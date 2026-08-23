import type { RefreshToken as Item } from "../../../../../shared/mod.ts";
import { entities } from "../../../../domain/entities/test/refresh-tokens.ts";
import { toDb } from "../../../repositories/refresh-token.ts";

export const items = {
  alice: toDb(entities.alice),
  bob: toDb(entities.bob),
} satisfies Record<string, Item>;
