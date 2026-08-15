import type { Kysely, Transaction } from "kysely";

export function runInTransaction<DB, T>(
  db: Kysely<DB>,
  work: (trx: Transaction<DB>) => Promise<T>,
): Promise<T> {
  return db.isTransaction //
    ? work(db as Transaction<DB>)
    : db.transaction().execute(work);
}
