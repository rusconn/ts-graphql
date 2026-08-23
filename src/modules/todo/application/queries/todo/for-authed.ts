import type { Dto } from "../../dtos/todo.ts";
import type { CountByUserParams, FindByUserParams, PageByUserParams } from "./params.ts";

export interface ITodoQueryForAuthed {
  find(id: Dto["id"]): Promise<Dto | undefined>;

  findByUser(params: FindByUserParams): Promise<Dto | undefined>;

  pageByUser(params: PageByUserParams): Promise<Dto[]>;

  countByUser(params: CountByUserParams): Promise<number>;
}
