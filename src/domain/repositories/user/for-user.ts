import type * as Entity from "../../entities.ts";

export interface IUserRepoForUser {
  add(user: Entity.User.Type): Promise<void>;

  update(user: Entity.User.Type): Promise<void>;

  remove(id: Entity.User.Type["id"]): Promise<void>;
}
