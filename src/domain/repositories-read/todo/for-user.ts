import type * as Entity from "../../entities/todo.ts";

export interface ITodoReaderRepoForUser {
  find(id: Entity.Type["id"]): Promise<Entity.Type | undefined>;

  count(): Promise<number>;
}
