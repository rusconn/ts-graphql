import type { Tagged } from "type-fest";

import * as Entities from "../../domain/entities.ts";

export type Type = Tagged<Raw, "RefreshTokenDto">;

type Raw = Pick<
  Entities.RefreshToken.Type,
  | "token" //
  | "userId"
  | "expiresAt"
  | "createdAt"
>;

export function fromEntity(entity: Entities.RefreshToken.Type): Type {
  return {
    token: entity.token,
    userId: entity.userId,
    expiresAt: entity.expiresAt,
    createdAt: entity.createdAt,
  } satisfies Raw as Type;
}
