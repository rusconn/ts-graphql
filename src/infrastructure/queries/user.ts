import type { ReadonlyKysely } from "kysely/readonly";

import * as Dtos from "../../application/dtos.ts";
import type { IUserQueryForAuthed } from "../../application/queries/user/for-authed.ts";
import type * as Entity from "../../domain/entities.ts";
import type { DB, User } from "../datasources/db/types.ts";
import * as UserLoader from "./user/loaders/user.ts";

export class UserQuery implements IUserQueryForAuthed {
  #loaders;

  constructor(db: ReadonlyKysely<DB>, tenantId?: Entity.User.Type["id"]) {
    this.#loaders = {
      user: UserLoader.create(db, tenantId),
    };
  }

  async find(id: Entity.User.Type["id"]) {
    const user = await this.#loaders.user.load(id);
    return user && toDto(user);
  }
}

export function toDto(user: User): Dtos.User.Type {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as Dtos.User.Type;
}
