import { entities } from "../../../domain/entities/_test/users.ts";
import { fromEntity } from "../user.ts";

export const dtos = {
  alice: fromEntity(entities.alice),
  bob: fromEntity(entities.bob),
};
