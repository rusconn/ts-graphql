import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";

export type Type = Tagged<Raw, "RefreshTokenDto">;

type Raw = Pick<
  Domain.RefreshToken.Type,
  | "token" //
  | "userId"
  | "expiresAt"
  | "createdAt"
>;

export function fromDomain(domain: Domain.RefreshToken.Type): Type {
  return {
    token: domain.token,
    userId: domain.userId,
    expiresAt: domain.expiresAt,
    createdAt: domain.createdAt,
  } satisfies Raw as Type;
}
