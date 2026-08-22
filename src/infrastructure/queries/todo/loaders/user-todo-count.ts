import DataLoader from "dataloader";
import type { ReadonlyKysely } from "kysely/readonly";
import type { Except } from "type-fest";

import type { CountByUserParams } from "../../../../application/queries/todo/params.ts";
import type * as Entity from "../../../../domain/entities/todo.ts";
import { fetchPerGroup } from "../../../../lib/dataloader/fetch-per-group.ts";
import { sort } from "../../../../lib/dataloader/sort.ts";
import type { DB, Todo } from "../../../datasources/db/types.ts";

type Key = CountByUserParams;

export function create(db: ReadonlyKysely<DB>, tenantId?: Entity.Type["userId"]) {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: JSON.stringify });
}

const batchGet =
  (db: ReadonlyKysely<DB>, tenantId?: Entity.Type["userId"]) => (keys: readonly Key[]) =>
    fetchPerGroup(
      keys,
      (key: Except<Key, "userId">) =>
        JSON.stringify([
          key.status, //
          key.search,
        ]),
      (group) => fetchGroup(db, group, tenantId),
    );

async function fetchGroup(
  db: ReadonlyKysely<DB>,
  keys: readonly Key[],
  tenantId?: Entity.Type["userId"],
) {
  const userIds = keys.map((key) => key.userId);
  const { status, search } = keys.at(0)!;
  const lowerSearch = search?.toLowerCase();

  const counts = await db
    .selectFrom("todos")
    .where("userId", "in", userIds)
    .$if(tenantId != null, (qb) => qb.where("userId", "=", tenantId!))
    .$if(status != null, (qb) => qb.where("status", "=", status!))
    .$if(search != null, (qb) =>
      qb.where(({ eb, fn }) =>
        eb.or([
          eb(fn("lower", ["title"]), "like", `%${lowerSearch!}%`),
          eb(fn("lower", ["description"]), "like", `%${lowerSearch!}%`),
        ]),
      ),
    )
    .groupBy("userId")
    .select("userId")
    .select(({ fn }) => fn.count<number>("userId").as("count"))
    .execute();

  type Count = {
    userId: Todo["userId"];
    count: number;
  };

  const defaultValue = {
    userId: "",
    count: 0,
  } as Count;

  return sort(userIds, counts as Count[], (count) => count.userId, defaultValue) //
    .map(({ count }) => count);
}
