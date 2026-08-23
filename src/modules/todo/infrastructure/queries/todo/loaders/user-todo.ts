import DataLoader from "dataloader";
import type { ReadonlyKysely } from "kysely/readonly";

import { sort } from "../../../../../../lib/dataloader/sort.ts";
import type { DB } from "../../../../../shared/mod.ts";
import type { FindByUserParams } from "../../../../application/queries/todo/params.ts";
import type { Entity } from "../../../../domain/entities/todo.ts";

type Key = FindByUserParams;

export function create(db: ReadonlyKysely<DB>, tenantId?: Entity["userId"]) {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: combine });
}

const batchGet =
  (db: ReadonlyKysely<DB>, tenantId?: Entity["userId"]) => async (keys: readonly Key[]) => {
    const todos = await db
      .selectFrom("todos")
      .where(({ eb, refTuple, tuple }) =>
        eb(
          refTuple("id", "userId"),
          "in",
          keys.map((key) => tuple(key.id, key.userId)),
        ),
      )
      .$if(tenantId != null, (qb) => qb.where("userId", "=", tenantId!))
      .selectAll()
      .execute();

    return sort(keys.map(combine), todos, combine);
  };

function combine(key: Key) {
  return key.id + key.userId;
}
