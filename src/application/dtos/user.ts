import type { Tagged } from "type-fest";

import * as Entities from "../../domain/entities.ts";

export type Type = Tagged<Raw, "UserDto">;

type Raw = Pick<
  Entities.User.Type,
  | "id" //
  | "name"
  | "email"
  | "role"
  | "createdAt"
  | "updatedAt"
>;

export function fromEntity(entity: Entities.User.Type): Type {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    role: entity.role,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  } satisfies Raw as Type;
}
