import type * as Entity from "../../entities/user.ts";

export interface IUserRepoForAdmin {
  find(id: Entity.Type["id"]): Promise<Entity.Type | undefined>;

  findByEmail(email: Entity.Type["email"]): Promise<Entity.Type | undefined>;

  add(user: Entity.Type): Promise<void>;

  update(user: Entity.Type): Promise<void>;

  remove(id: Entity.Type["id"]): Promise<void>;
}
