import type { IRefreshTokenRepoForAuthed } from "../../domain/repositories/refresh-token/for-authed.ts";
import type { ITodoRepoForAuthed } from "../../domain/repositories/todo/for-authed.ts";
import type { IUserRepoForAuthed } from "../../domain/repositories/user/for-authed.ts";

export interface IUnitOfWorkForAuthed {
  run<T>(work: (repos: IUnitOfWorkReposForAuthed) => Promise<T>): Promise<T>;
}

export type IUnitOfWorkReposForAuthed = {
  refreshToken: IRefreshTokenRepoForAuthed;
  todo: ITodoRepoForAuthed;
  user: IUserRepoForAuthed;
};
