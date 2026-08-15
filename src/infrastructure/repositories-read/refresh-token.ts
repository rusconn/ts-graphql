import type { ReadonlyKysely } from "kysely/readonly";

import type * as Entity from "../../domain/entities/refresh-token.ts";
import type { IRefreshTokenReaderRepo } from "../../domain/repositories-read/refresh-token.ts";
import type { DB } from "../datasources/db/types.ts";
import { toEntity } from "../repositories/refresh-token.ts";

export class RefreshTokenReaderRepo implements IRefreshTokenReaderRepo {
  #db;

  constructor(db: ReadonlyKysely<DB>) {
    this.#db = db;
  }

  async find(token: Entity.Type["token"]) {
    const refreshToken = await this.#db
      .selectFrom("refreshTokens")
      .where("token", "=", token)
      .selectAll()
      .executeTakeFirst();

    return refreshToken && toEntity(refreshToken);
  }
}
