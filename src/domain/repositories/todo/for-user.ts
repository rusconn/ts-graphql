import type * as Entity from "../../entities/todo.ts";

export interface ITodoRepoForUser {
  add(todo: Entity.Type): Promise<void>;

  update(todo: Entity.Type): Promise<void>;

  remove(id: Entity.Type["id"]): Promise<void>;

  removeByUserId(userId: Entity.Type["userId"]): Promise<void>;
}
