import { toDto } from "../../../../../infrastructure/queries/user.ts";
import { items as users } from "../items/users.ts";

export const dtos = {
  alice: toDto(users.alice),
  bob: toDto(users.bob),
};
