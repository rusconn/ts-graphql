import { toDto } from "../../../../../infrastructure/queries/user.ts";
import { db as users } from "../db/users.ts";

export const dto = {
  admin: toDto(users.admin),
  alice: toDto(users.alice),
};
