import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";

export type Type = Tagged<Raw, "TodoDto">;

type Raw = Pick<
  Domain.Todo.Type,
  | "id" //
  | "title"
  | "description"
  | "status"
  | "userId"
  | "createdAt"
  | "updatedAt"
>;

export function fromDomain(domain: Domain.Todo.Type): Type {
  return {
    id: domain.id,
    title: domain.title,
    description: domain.description,
    status: domain.status,
    userId: domain.userId,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
  } satisfies Raw as Type;
}
