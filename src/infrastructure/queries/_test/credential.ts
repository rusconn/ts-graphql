import type { Transaction } from "kysely";

import * as Dtos from "../../../application/dtos.ts";
import type { DB } from "../../datasources/db/types.ts";

export class CredentialQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async find(userId: Dtos.Credential.Type["userId"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirst();

    if (credential == null) {
      return undefined;
    }

    return credential as Dtos.Credential.Type;
  }

  async findOrThrow(userId: Dtos.Credential.Type["userId"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirstOrThrow();

    return credential as Dtos.Credential.Type;
  }
}
