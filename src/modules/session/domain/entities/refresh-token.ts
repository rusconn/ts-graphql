import type { Tagged } from "type-fest";

import { addDates } from "../../../../lib/date-immutable.ts";
import type { UserEntity } from "../../../user/mod.ts";
import { Token, type TokenHashed } from "./refresh-token/token.ts";

export type { Token as RefreshToken } from "./refresh-token/token.ts";

export type Entity = Tagged<Raw, "RefreshTokenEntity">;

type Raw = {
  token: TokenHashed;
  userId: UserEntity["id"];
  expiresAt: Date;
  createdAt: Date;
};

export const Entity = {
  MAX_RETENTION: 5,

  async create(
    userId: Entity["userId"],
  ): Promise<{ rawRefreshToken: Token; refreshToken: Entity }> {
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
      } satisfies Raw as Entity,
    };
  },

  isExpired(refreshToken: Entity): boolean {
    return refreshToken.expiresAt < new Date();
  },

  Token,
};
