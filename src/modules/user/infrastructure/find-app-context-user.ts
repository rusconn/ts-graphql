import type { Kysely } from "kysely";

import type { DB } from "../../shared/mod.ts";
import type { Entity as User } from "../domain/entities/user.ts";
import { toDto } from "./queries/user.ts";

export async function findAppContextUser(id: User["id"], kysely: Kysely<DB>) {
  const user = await kysely
    .selectFrom("users") //
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return user && toDto(user);
}
