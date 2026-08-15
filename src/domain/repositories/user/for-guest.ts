import type * as Entity from "../../entities.ts";

export interface IUserRepoForGuest {
  findByEmail(email: Entity.User.Type["email"]): Promise<Entity.User.Type | undefined>;

  add(user: Entity.User.Type): Promise<void>;

  update(user: Entity.User.Type): Promise<void>;
}
