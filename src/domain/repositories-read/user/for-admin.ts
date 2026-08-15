import type * as Entity from "../../entities/user.ts";

export interface IUserReaderRepoForAdmin {
  find(id: Entity.Type["id"]): Promise<Entity.Type | undefined>;

  findByEmail(email: Entity.Type["email"]): Promise<Entity.Type | undefined>;
}
