import type * as Entity from "../../entities/todo.ts";

export interface ITodoReaderRepoForAdmin {
  find(id: Entity.Type["id"]): Promise<Entity.Type | undefined>;

  count(): Promise<number>;
}
