import type * as Entity from "../../entities/user.ts";

export interface IUserReaderRepoForGuest {
  findByEmail(email: Entity.Type["email"]): Promise<Entity.Type | undefined>;
}
