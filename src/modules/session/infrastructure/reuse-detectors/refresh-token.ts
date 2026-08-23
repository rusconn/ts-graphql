import { TimeUnit, type GlideClient } from "@valkey/valkey-glide";

import type { IRefreshTokenReuseDetector } from "../../application/reuse-detectors/refresh-token.ts";
import type { Entity } from "../../domain/entities/refresh-token.ts";

export class RefreshTokenReuseDetector implements IRefreshTokenReuseDetector {
  #getValkey;

  constructor(getValkey: () => Promise<GlideClient>) {
    this.#getValkey = getValkey;
  }

  async isUsed(token: Entity["token"]) {
    const client = await this.#getValkey();
    const userId = await client.get(toKey(token));
    return (userId as Entity["userId"] | null) ?? undefined;
  }

  async markUsed(input: { token: Entity["token"]; userId: Entity["userId"]; ttlSeconds: number }) {
    const { token, userId, ttlSeconds } = input;
    const client = await this.#getValkey();
    await client.set(toKey(token), userId, {
      expiry: {
        type: TimeUnit.Seconds,
        count: ttlSeconds,
      },
    });
  }
}

function toKey(token: Entity["token"]) {
  return `used_refresh_token:${token}`;
}
