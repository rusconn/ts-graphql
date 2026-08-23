import type { Transaction } from "kysely";

import type { DB } from "../../../../shared/mod.ts";
import type { UserEntity } from "../../../../user/mod.ts";
import { toEntity } from "../../repositories/refresh-token.ts";

export class RefreshTokenQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async findTheirs(userId: UserEntity["id"]) {
    const refreshTokens = await this.#trx
      .selectFrom("refreshTokens")
      .where("userId", "=", userId)
      .selectAll()
      .execute();

    return refreshTokens.map(toEntity);
  }

  async countTheirs(userId: UserEntity["id"]) {
    const result = await this.#trx
      .selectFrom("refreshTokens")
      .where("userId", "=", userId)
      .select(({ fn }) => fn.count<number>("token").as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  }

  async count() {
    const result = await this.#trx
      .selectFrom("refreshTokens")
      .select(({ fn }) => fn.count<number>("token").as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  }
}
