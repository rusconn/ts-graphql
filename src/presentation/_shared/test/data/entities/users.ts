import * as UserRepo from "../../../../../infrastructure/repositories/user.ts";
import { items as credentials } from "../items/credentials.ts";
import { items as users } from "../items/users.ts";

export const entities = {
  alice: UserRepo.toEntity(users.alice, credentials.alice),
  bob: UserRepo.toEntity(users.bob, credentials.bob),
};
