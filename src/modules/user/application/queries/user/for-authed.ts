import type { Dto } from "../../dtos/user.ts";

export interface IUserQueryForAuthed {
  find(id: Dto["id"]): Promise<Dto | undefined>;
}
