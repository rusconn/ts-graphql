import type { Transaction } from "kysely";

import * as Dto from "../../../application/dtos/credential.ts";
import type { DB } from "../../datasources/db/types.ts";

export class CredentialQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async find(userId: Dto.Type["userId"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirst();

    if (credential == null) {
      return undefined;
    }

    return credential as Dto.Type;
  }

  async findOrThrow(userId: Dto.Type["userId"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirstOrThrow();

    return credential as Dto.Type;
  }
}
