import DataLoader from "dataloader";
import type { ReadonlyKysely } from "kysely/readonly";

import { sort } from "../../../../../../lib/dataloader/sort.ts";
import type { DB, Uuidv7 } from "../../../../../shared/mod.ts";
import type { Entity } from "../../../../domain/entities/user.ts";

type Key = Uuidv7;

export function create(db: ReadonlyKysely<DB>, tenantId?: Entity["id"]) {
  return new DataLoader(batchGet(db, tenantId));
}

const batchGet =
  (db: ReadonlyKysely<DB>, tenantId?: Entity["id"]) => async (keys: readonly Key[]) => {
    const users = await db //
      .selectFrom("users")
      .where("id", "in", keys)
      .$if(tenantId != null, (qb) => qb.where("id", "=", tenantId!))
      .selectAll()
      .execute();

    return sort(keys, users, (user) => user.id);
  };
