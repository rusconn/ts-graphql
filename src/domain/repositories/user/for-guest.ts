import type * as Entity from "../../entities.ts";

export interface IUserRepoForGuest {
  add(user: Entity.User.Type): Promise<void>;

  update(user: Entity.User.Type): Promise<void>;
}
