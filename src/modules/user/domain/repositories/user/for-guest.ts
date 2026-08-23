import type { Entity } from "../../entities/user.ts";

export interface IUserRepoForGuest {
  findByEmail(email: Entity["email"]): Promise<Entity | undefined>;

  add(user: Entity): Promise<void>;

  update(user: Entity): Promise<void>;
}
