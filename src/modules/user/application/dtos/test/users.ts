import { entities } from "../../../domain/entities/test/users.ts";
import { Dto } from "../user.ts";

export const dtos = {
  alice: Dto.fromEntity(entities.alice),
  bob: Dto.fromEntity(entities.bob),
};
