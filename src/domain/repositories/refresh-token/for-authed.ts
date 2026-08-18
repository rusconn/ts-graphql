import type * as Entity from "../../entities/refresh-token.ts";

export interface IRefreshTokenRepoForAuthed {
  find(token: Entity.Type["token"]): Promise<Entity.Type | undefined>;

  add(refreshToken: Entity.Type): Promise<void>;

  retainLatest(userId: Entity.Type["userId"], limit: number): Promise<void>;

  remove(token: Entity.Type["token"]): Promise<void>;

  removeByUserId(userId: Entity.Type["userId"]): Promise<void>;
}
