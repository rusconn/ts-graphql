import process from "node:process";

import type { Transaction } from "kysely";

import { kysely } from "../src/app/datasources/db/client.ts";
import type { DB } from "../src/modules/shared/mod.ts";

export async function seed(seedFn: (trx: Transaction<DB>) => Promise<void>) {
  try {
    await kysely.transaction().execute(seedFn);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await kysely.destroy();
  }
}
