import type { Transaction } from "kysely";

import type * as Dto from "../../../application/dtos/refresh-token.ts";
import type { DB } from "../../datasources/db/types.ts";
import { toEntity } from "../../repositories/refresh-token.ts";

export class RefreshTokenQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async findTheirs(userId: Dto.Type["userId"]) {
    const refreshTokens = await this.#trx
      .selectFrom("refreshTokens")
      .where("userId", "=", userId)
      .selectAll()
      .execute();

    return refreshTokens.map(toEntity);
  }

  async countTheirs(userId: Dto.Type["userId"]) {
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
