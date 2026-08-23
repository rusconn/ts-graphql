import type { Entity } from "../../entities/user.ts";

export interface IUserRepoForAuthed {
  find(id: Entity["id"]): Promise<Entity | undefined>;

  findByEmail(email: Entity["email"]): Promise<Entity | undefined>;

  add(user: Entity): Promise<void>;

  update(user: Entity): Promise<void>;

  remove(id: Entity["id"]): Promise<void>;
}
