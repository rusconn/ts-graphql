import type { ReadonlyKysely } from "kysely/readonly";

import type { DB, User } from "../../../shared/mod.ts";
import { Dto } from "../../application/dtos/user.ts";
import type { IUserQueryForAuthed } from "../../application/queries/user/for-authed.ts";
import type { Entity } from "../../domain/entities/user.ts";
import * as UserLoader from "./user/loaders/user.ts";

export class UserQuery implements IUserQueryForAuthed {
  #loaders;

  constructor(db: ReadonlyKysely<DB>, tenantId?: Entity["id"]) {
    this.#loaders = {
      user: UserLoader.create(db, tenantId),
    };
  }

  async find(id: Entity["id"]) {
    const user = await this.#loaders.user.load(id);
    return user && toDto(user);
  }
}

export function toDto(user: User): Dto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as Dto;
}
