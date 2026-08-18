import type { Type as Todo } from "../../dtos/todo.ts";
import type { CountByUserParams, FindByUserParams, PageByUserParams } from "./params.ts";

export interface ITodoQueryForAuthed {
  find(id: Todo["id"]): Promise<Todo | undefined>;

  findByUser(params: FindByUserParams): Promise<Todo | undefined>;

  pageByUser(params: PageByUserParams): Promise<Todo[]>;

  countByUser(params: CountByUserParams): Promise<number>;
}
