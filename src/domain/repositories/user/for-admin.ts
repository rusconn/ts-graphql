import type * as Entity from "../../entities/user.ts";

export interface IUserRepoForAdmin {
  add(user: Entity.Type): Promise<void>;

  update(user: Entity.Type): Promise<void>;

  remove(id: Entity.Type["id"]): Promise<void>;
}
