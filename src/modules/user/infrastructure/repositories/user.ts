import type { Kysely } from "kysely";

import { runInTransaction } from "../../../../lib/kysely-extra.ts";
import { isPgError } from "../../../../lib/pg-extra.ts";
import { PostgreSQLErrorCode } from "../../../../lib/postgresql/error-code.ts";
import { entityNotFoundError, type DB, type User, type Credential } from "../../../shared/mod.ts";
import { emailAlreadyExistsError } from "../../application/errors/email-already-exists.ts";
import { Entity } from "../../domain/entities/user.ts";
import type { IUserRepoForAuthed } from "../../domain/repositories/user/for-authed.ts";
import type { IUserRepoForGuest } from "../../domain/repositories/user/for-guest.ts";

export class UserRepo implements IUserRepoForAuthed, IUserRepoForGuest {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Entity["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Entity["id"]) {
    return await this.#find({ id });
  }

  async findByEmail(email: Entity["email"]) {
    return await this.#find({ email });
  }

  async #find(filter: Partial<Pick<Entity, "id" | "email">>) {
    const result = await this.#db
      .selectFrom("users")
      .innerJoin("credentials", "users.id", "credentials.userId")
      .$if(filter.id != null, (qb) => qb.where("users.id", "=", filter.id!))
      .$if(filter.email != null, (qb) => qb.where("users.email", "=", filter.email!))
      .$if(this.#tenantId != null, (qb) => qb.where("users.id", "=", this.#tenantId!))
      .select([
        "users.id as usersId",
        "users.name as usersName",
        "users.email as usersEmail",
        "users.createdAt as usersCreatedAt",
        "users.updatedAt as usersUpdatedAt",
      ])
      .select(["credentials.password as credentialsPassword"])
      .executeTakeFirst();

    if (result == null) {
      return undefined;
    }

    const user: User = {
      id: result.usersId,
      name: result.usersName,
      email: result.usersEmail,
      createdAt: result.usersCreatedAt,
      updatedAt: result.usersUpdatedAt,
    };
    const credential: Pick<Credential, "password"> = {
      password: result.credentialsPassword,
    };

    return toEntity(user, credential);
  }

  async add(user: Entity) {
    if (this.#tenantId != null && user.id !== this.#tenantId) {
      throw new Error("forbidden");
    }

    const { user: dbUser, credential: dbCredential } = toDb(user);

    try {
      await runInTransaction(this.#db, async (trx) => {
        await trx
          .insertInto("users") //
          .values(dbUser)
          .execute();
        await trx
          .insertInto("credentials") //
          .values(dbCredential)
          .execute();
      });
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PostgreSQLErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            throw emailAlreadyExistsError();
          }
        }
      }
      throw e;
    }
  }

  async update(user: Entity) {
    const { user: dbUser, credential: dbCredential } = toDb(user);

    try {
      await runInTransaction(this.#db, async (trx) => {
        await trx
          .updateTable("users")
          .set(dbUser)
          .where("id", "=", user.id)
          .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
          .returning("id")
          .executeTakeFirstOrThrow(entityNotFoundError);
        await trx
          .updateTable("credentials")
          .set(dbCredential)
          .where("userId", "=", user.id)
          .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
          .returning("userId")
          .executeTakeFirstOrThrow(entityNotFoundError);
      });
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PostgreSQLErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            throw emailAlreadyExistsError();
          }
        }
      }
      throw e;
    }
  }

  async remove(id: Entity["id"]) {
    await this.#db
      .deleteFrom("users") // CASCADE
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }
}

export function toDb({ password, ...rest }: Entity): {
  user: User;
  credential: Credential;
} {
  return {
    user: rest,
    credential: {
      userId: rest.id,
      password,
    },
  };
}

export function toEntity(user: User, credential: Pick<Credential, "password">): Entity {
  return {
    ...user,
    password: credential.password,
  } as Entity;
}
