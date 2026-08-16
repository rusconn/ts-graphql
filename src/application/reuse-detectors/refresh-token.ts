import type * as Entity from "../../domain/entities.ts";

export interface IRefreshTokenReuseDetector {
  isUsed(token: Entity.RefreshToken.Token.TypeHashed): Promise<Entity.User.Type["id"] | undefined>;

  markUsed(input: {
    token: Entity.RefreshToken.Token.TypeHashed;
    userId: Entity.User.Type["id"];
    ttlSeconds: number;
  }): Promise<void>;
}
