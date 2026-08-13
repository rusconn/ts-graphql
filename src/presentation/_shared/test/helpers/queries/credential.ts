import type { Transaction } from "kysely";

import * as Dto from "../../../../../application/dto.ts";
import type { DB } from "../../../../../infrastructure/datasources/db/types.ts";

export class CredentialQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async find(userId: Dto.Credential.Type["userId"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirst();

    if (credential == null) {
      return undefined;
    }

    return credential as Dto.Credential.Type;
  }

  async findOrThrow(userId: Dto.Credential.Type["userId"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirstOrThrow();

    return credential as Dto.Credential.Type;
  }
}
