import DataLoader from "dataloader";
import type { ReadonlyKysely } from "kysely/readonly";
import type { Except } from "type-fest";

import type { PageByUserParams } from "../../../../application/queries/todo/params.ts";
import type * as Domain from "../../../../domain/entities.ts";
import { fetchPerGroup } from "../../../../lib/dataloader/fetch-per-group.ts";
import { sortGroup } from "../../../../lib/dataloader/sort-group.ts";
import type { DB } from "../../../datasources/db/types.ts";

type Key = PageByUserParams;

export function create(db: ReadonlyKysely<DB>, tenantId?: Domain.User.Type["id"]) {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: JSON.stringify });
}

const batchGet =
  (db: ReadonlyKysely<DB>, tenantId?: Domain.User.Type["id"]) => (keys: readonly Key[]) =>
    fetchPerGroup(
      keys,
      (key: Except<Key, "userId">) =>
        JSON.stringify([
          key.sortKey, //
          key.reverse,
          key.cursor,
          key.limit,
          key.status,
          key.search,
        ]),
      (group) => fetchGroup(db, group, tenantId),
    );

async function fetchGroup(
  db: ReadonlyKysely<DB>,
  keys: readonly Key[],
  tenantId?: Domain.User.Type["id"],
) {
  const userIds = keys.map((key) => key.userId);
  const { sortKey, reverse, cursor, limit, status, search } = keys.at(0)!;
  const lowerSearch = search?.toLowerCase();

  const [direction, comp] = reverse //
    ? (["desc", "<"] as const)
    : (["asc", ">"] as const);

  const cursorSortKey =
    cursor != null
      ? db
          .selectFrom("todos") //
          .where("id", "=", cursor)
          .select(sortKey)
      : undefined;

  const todos = await db
    .selectFrom("users")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("todos")
          .whereRef("users.id", "=", "todos.userId")
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(refTuple(sortKey, "id"), comp, tuple(cursorSortKey!, cursor!)),
            ),
          )
          .$if(status != null, (qb) => qb.where("status", "=", status!))
          .$if(search != null, (qb) =>
            qb.where(({ eb, fn }) =>
              eb.or([
                eb(fn("lower", ["title"]), "like", `%${lowerSearch!}%`),
                eb(fn("lower", ["description"]), "like", `%${lowerSearch!}%`),
              ]),
            ),
          )
          .selectAll("todos")
          .orderBy(sortKey, direction)
          .orderBy("id", direction)
          .limit(limit)
          .as("todos"),
      (join) => join.onTrue(),
    )
    .where("users.id", "in", userIds)
    .$if(tenantId != null, (qb) => qb.where("users.id", "=", tenantId!))
    .selectAll("todos")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  return sortGroup(userIds, todos, (todo) => todo.userId);
}
