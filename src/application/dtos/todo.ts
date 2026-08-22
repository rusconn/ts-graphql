import type { Tagged } from "type-fest";

import * as Entity from "../../domain/entities/todo.ts";

export type Type = Tagged<Raw, "TodoDto">;

type Raw = Pick<
  Entity.Type,
  | "id" //
  | "title"
  | "description"
  | "status"
  | "userId"
  | "createdAt"
  | "updatedAt"
>;

export function fromEntity(entity: Entity.Type): Type {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    status: entity.status,
    userId: entity.userId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  } satisfies Raw as Type;
}
