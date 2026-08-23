import type { Entity } from "../../domain/entities/refresh-token.ts";

export interface IRefreshTokenReuseDetector {
  isUsed(token: Entity["token"]): Promise<Entity["userId"] | undefined>;

  markUsed(input: {
    token: Entity["token"];
    userId: Entity["userId"];
    ttlSeconds: number;
  }): Promise<void>;
}
