import type { Kysely } from "kysely";

import { entityNotFoundError, type DB, type RefreshToken } from "../../../shared/mod.ts";
import { Entity } from "../../domain/entities/refresh-token.ts";
import type { IRefreshTokenRepoForAuthed } from "../../domain/repositories/refresh-token/for-authed.ts";
import type { IRefreshTokenRepoForGuest } from "../../domain/repositories/refresh-token/for-guest.ts";

export class RefreshTokenRepo implements IRefreshTokenRepoForAuthed, IRefreshTokenRepoForGuest {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Entity["userId"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(token: Entity["token"]) {
    const refreshToken = await this.#db
      .selectFrom("refreshTokens")
      .where("token", "=", token)
      .selectAll()
      .executeTakeFirst();

    return refreshToken && toEntity(refreshToken);
  }

  async add(refreshToken: Entity) {
    if (this.#tenantId != null && refreshToken.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    const dbRefreshToken = toDb(refreshToken);

    await this.#db
      .insertInto("refreshTokens") //
      .values(dbRefreshToken)
      .execute();
  }

  async retainLatest(userId: Entity["userId"], limit: number) {
    await this.#db
      .deleteFrom("refreshTokens")
      .where(({ eb }) =>
        eb(
          "token",
          "not in",
          eb
            .selectFrom("refreshTokens")
            .where("userId", "=", userId)
            .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
            .select("token")
            .orderBy("createdAt", "desc")
            .limit(limit),
        ),
      )
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();
  }

  async remove(token: Entity["token"]) {
    await this.#db
      .deleteFrom("refreshTokens")
      .where("token", "=", token)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("userId")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async removeByUserId(userId: Entity["userId"]) {
    await this.#db
      .deleteFrom("refreshTokens")
      .where("userId", "=", userId)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .execute();
  }
}

export function toDb(refreshToken: Entity): RefreshToken {
  return refreshToken;
}

export function toEntity(refreshToken: RefreshToken): Entity {
  return refreshToken as Entity;
}
