import type { Tagged } from "type-fest";

import * as Entity from "../../domain/entities/user.ts";

export type Type = Tagged<Raw, "UserDto">;

type Raw = Pick<
  Entity.Type,
  | "id" //
  | "name"
  | "email"
  | "createdAt"
  | "updatedAt"
>;

export function fromEntity(entity: Entity.Type): Type {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  } satisfies Raw as Type;
}
