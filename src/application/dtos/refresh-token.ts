import type { Tagged } from "type-fest";

import * as Entity from "../../domain/entities/refresh-token.ts";

export type Type = Tagged<Raw, "RefreshTokenDto">;

type Raw = Pick<
  Entity.Type,
  | "token" //
  | "userId"
  | "expiresAt"
  | "createdAt"
>;

export function fromEntity(entity: Entity.Type): Type {
  return {
    token: entity.token,
    userId: entity.userId,
    expiresAt: entity.expiresAt,
    createdAt: entity.createdAt,
  } satisfies Raw as Type;
}
