import type * as Entity from "../entities/refresh-token.ts";

export interface IRefreshTokenReaderRepo {
  find(token: Entity.Type["token"]): Promise<Entity.Type | undefined>;
}
