import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";

export type Type = Tagged<Raw, "UserDto">;

type Raw = Pick<
  Domain.User.Type,
  | "id" //
  | "name"
  | "email"
  | "role"
  | "createdAt"
  | "updatedAt"
>;

export function fromDomain(domain: Domain.User.Type): Type {
  return {
    id: domain.id,
    name: domain.name,
    email: domain.email,
    role: domain.role,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
  } satisfies Raw as Type;
}
