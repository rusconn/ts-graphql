import type { Type as User } from "../../dtos/user.ts";

export interface IUserQueryForUser {
  find(id: User["id"]): Promise<User | undefined>;
}
