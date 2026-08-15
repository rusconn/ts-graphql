import { toDto } from "../../../../../infrastructure/queries/user.ts";
import { items as users } from "../items/users.ts";

export const dtos = {
  admin: toDto(users.admin),
  alice: toDto(users.alice),
};
