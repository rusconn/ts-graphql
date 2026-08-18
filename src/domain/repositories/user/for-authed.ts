import type * as Entity from "../../entities.ts";

export interface IUserRepoForAuthed {
  find(id: Entity.User.Type["id"]): Promise<Entity.User.Type | undefined>;

  findByEmail(email: Entity.User.Type["email"]): Promise<Entity.User.Type | undefined>;

  add(user: Entity.User.Type): Promise<void>;

  update(user: Entity.User.Type): Promise<void>;

  remove(id: Entity.User.Type["id"]): Promise<void>;
}
