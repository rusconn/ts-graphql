import { TimeUnit } from "@valkey/valkey-glide";

import type { IRefreshTokenReuseDetector } from "../../application/reuse-detectors/refresh-token.ts";
import type * as Entity from "../../domain/entities/refresh-token.ts";
import { getValkey } from "../datasources/valkey/client.ts";

export class RefreshTokenReuseDetector implements IRefreshTokenReuseDetector {
  async isUsed(token: Entity.Token.TypeHashed) {
    const client = await getValkey();
    const userId = await client.get(toKey(token));
    return (userId as Entity.Type["userId"] | null) ?? undefined;
  }

  async markUsed(input: {
    token: Entity.Token.TypeHashed;
    userId: Entity.Type["userId"];
    ttlSeconds: number;
  }) {
    const { token, userId, ttlSeconds } = input;
    const client = await getValkey();
    await client.set(toKey(token), userId, {
      expiry: {
        type: TimeUnit.Seconds,
        count: ttlSeconds,
      },
    });
  }
}

function toKey(token: Entity.Token.TypeHashed) {
  return `used_refresh_token:${token}`;
}
