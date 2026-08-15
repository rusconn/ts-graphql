import type { Tagged } from "type-fest";

import * as Entities from "../../domain/entities.ts";

export type Type = Tagged<Raw, "TodoDto">;

type Raw = Pick<
  Entities.Todo.Type,
  | "id" //
  | "title"
  | "description"
  | "status"
  | "userId"
  | "createdAt"
  | "updatedAt"
>;

export function fromEntity(entity: Entities.Todo.Type): Type {
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
