import type * as Entity from "../../entities/user.ts";

export interface IUserRepoForGuest {
  findByEmail(email: Entity.Type["email"]): Promise<Entity.Type | undefined>;

  add(user: Entity.Type): Promise<void>;

  update(user: Entity.Type): Promise<void>;
}
