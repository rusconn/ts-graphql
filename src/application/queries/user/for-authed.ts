import type { Type as User } from "../../dtos/user.ts";

export interface IUserQueryForAuthed {
  find(id: User["id"]): Promise<User | undefined>;
}
