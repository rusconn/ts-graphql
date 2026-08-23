import type { Entity } from "../../entities/todo.ts";

export interface ITodoRepoForAuthed {
  find(id: Entity["id"]): Promise<Entity | undefined>;

  count(): Promise<number>;

  add(todo: Entity): Promise<void>;

  update(todo: Entity): Promise<void>;

  remove(id: Entity["id"]): Promise<void>;

  removeByUserId(userId: Entity["userId"]): Promise<void>;
}
