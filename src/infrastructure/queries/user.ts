import type { ReadonlyKysely } from "kysely/readonly";

import * as Dtos from "../../application/dtos.ts";
import type { IUserQueryForAdmin } from "../../application/queries/user/for-admin.ts";
import type { IUserQueryForUser } from "../../application/queries/user/for-user.ts";
import type * as Entity from "../../domain/entities.ts";
import type { DB, User } from "../datasources/db/types.ts";
import { fromDbRole } from "../repositories/user.ts";
import * as UserLoader from "./user/loaders/user.ts";

export class UserQuery implements IUserQueryForAdmin, IUserQueryForUser {
  #db;
  #loaders;

  constructor(db: ReadonlyKysely<DB>, tenantId?: Entity.User.Type["id"]) {
    this.#db = db;
    this.#loaders = {
      user: UserLoader.create(db, tenantId),
    };
  }

  async find(id: Entity.User.Type["id"]) {
    const user = await this.#loaders.user.load(id);
    return user && toDto(user);
  }

  async findMany(params: {
    sortKey: "createdAt" | "updatedAt";
    reverse: boolean;
    cursor?: Entity.User.Type["id"];
    limit: number;
  }) {
    const { sortKey, reverse, cursor, limit } = params;

    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const cursorSortKey =
      cursor != null
        ? this.#db
            .selectFrom("users") //
            .where("id", "=", cursor)
            .select(sortKey)
        : undefined;

    const users = await this.#db
      .selectFrom("users")
      .$if(cursor != null, (qb) =>
        qb.where(({ eb, refTuple, tuple }) =>
          eb(refTuple(sortKey, "id"), comp, tuple(cursorSortKey!, cursor!)),
        ),
      )
      .selectAll()
      .orderBy(sortKey, direction)
      .orderBy("id", direction)
      .limit(limit)
      .execute();

    return users.map(toDto);
  }

  async count() {
    const result = await this.#db
      .selectFrom("users")
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirst();

    return result?.count ?? 0;
  }
}

export function toDto(user: User): Dtos.User.Type {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: fromDbRole[user.role],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as Dtos.User.Type;
}
