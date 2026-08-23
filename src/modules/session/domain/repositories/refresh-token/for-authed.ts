import type { Entity } from "../../entities/refresh-token.ts";

export interface IRefreshTokenRepoForAuthed {
  find(token: Entity["token"]): Promise<Entity | undefined>;

  add(refreshToken: Entity): Promise<void>;

  retainLatest(userId: Entity["userId"], limit: number): Promise<void>;

  remove(token: Entity["token"]): Promise<void>;

  removeByUserId(userId: Entity["userId"]): Promise<void>;
}
