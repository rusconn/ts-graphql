import type { Tagged } from "type-fest";

import { Entity } from "../../domain/entities/user.ts";

export type Dto = Tagged<Raw, "UserDto">;

type Raw = Pick<
  Entity,
  | "id" //
  | "name"
  | "email"
  | "createdAt"
  | "updatedAt"
>;

export const Dto = {
  fromEntity(entity: Entity): Dto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } satisfies Raw as Dto;
  },
};
