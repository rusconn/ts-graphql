import type { Transaction } from "kysely";

import { kysely } from "../../src/app/datasources/db/client.ts";
import type { DB } from "../../src/modules/shared/mod.ts";

export async function clearTables() {
  await Promise.all([
    clearRefreshTokens(), //
    clearTodos(),
  ]);
  await clearUsers(); // CASCADE
}

async function clearRefreshTokens() {
  await kysely.deleteFrom("refreshTokens").execute();
}
async function clearTodos() {
  await kysely.deleteFrom("todos").execute();
}
async function clearUsers() {
  await kysely.deleteFrom("users").execute(); // CASCADE
}

// 直列実行ならトランザックション扱いでいいでしょ多分…
export const trx = kysely as Transaction<DB>;
