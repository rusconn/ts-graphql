import type * as Entity from "../../domain/entities/refresh-token.ts";

export interface IRefreshTokenReuseDetector {
  isUsed(token: Entity.Token.TypeHashed): Promise<Entity.Type["userId"] | undefined>;

  markUsed(input: {
    token: Entity.Token.TypeHashed;
    userId: Entity.Type["userId"];
    ttlSeconds: number;
  }): Promise<void>;
}
