import type { Tagged } from "type-fest";

import { addDates } from "../../lib/date-immutable.ts";
import * as Token from "./refresh-token/token.ts";
import * as User from "./user.ts";

export { Token };

export const MAX_RETENTION = 5;

export type Type = Tagged<Raw, "RefreshTokenEntity">;

type Raw = {
  token: Token.TypeHashed;
  userId: User.Type["id"];
  expiresAt: Date;
  createdAt: Date;
};

export async function create(
  userId: Type["userId"],
): Promise<{ rawRefreshToken: Token.Type; refreshToken: Type }> {
  const rawRefreshToken = Token.create();
  const createdAt = new Date();
  const expiresAt = addDates(createdAt, 7);

  return {
    rawRefreshToken,
    refreshToken: {
      userId,
      token: await Token.hash(rawRefreshToken),
      expiresAt,
      createdAt,
    } satisfies Raw as Type,
  };
}

export function isExpired(refreshToken: Type): boolean {
  return refreshToken.expiresAt < new Date();
}
