import type { Transaction } from "kysely";

import type { DB } from "../../../../shared/mod.ts";
import type { Entity as UserEntity } from "../../../domain/entities/user.ts";

type Credential = {
  userId: UserEntity["id"];
  password: UserEntity["password"];
};

export class CredentialQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async find(userId: UserEntity["id"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirst();

    if (credential == null) {
      return undefined;
    }

    return credential as Credential;
  }

  async findOrThrow(userId: UserEntity["id"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirstOrThrow();

    return credential as Credential;
  }
}
