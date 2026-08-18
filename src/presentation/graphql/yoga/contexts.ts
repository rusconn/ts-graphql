import type { YogaInitialContext } from "graphql-yoga";
import type { ReadonlyKysely } from "kysely/readonly";

import type { AppContextForGuest, AppContextForAuthed } from "../../../application/contexts.ts";
import type { ITodoQueryForAuthed } from "../../../application/queries/todo/for-authed.ts";
import type { IUserQueryForAuthed } from "../../../application/queries/user/for-authed.ts";
import * as AccessToken from "../../../application/session/access-token.ts";
import {
  createAppContextForGuest,
  createAppContextForAuthed,
  findAppContextUser,
} from "../../../infrastructure/context.ts";
import { createKysely } from "../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../infrastructure/datasources/db/types.ts";
import { pino } from "../../../infrastructure/loggers/pino.ts";
import { TodoQuery } from "../../../infrastructure/queries/todo.ts";
import { UserQuery } from "../../../infrastructure/queries/user.ts";
import { TodoRepo } from "../../../infrastructure/repositories/todo.ts";
import { authenticationError } from "../schema/_errors/global/authentication-error.ts";
import { tokenExpiredError } from "../schema/_errors/global/token-expired.ts";

export type Context = ContextForAuthed | ContextForGuest;

export type ContextForAuthed = ContextBase & AdditionalContextForAuthed & AppContextForAuthed;
export type ContextForGuest = ContextBase & AdditionalContextForGuest & AppContextForGuest;

type ContextBase = YogaInitialContext & PluginContext;

export type PluginContext = {
  requestId?: string;
  queryComplexity?: number;
};

type AdditionalContextForAuthed = {
  start: number;
  queries: {
    todo: ITodoQueryForAuthed;
    user: IUserQueryForAuthed;
  };
};
type AdditionalContextForGuest = {
  start: number;
};

export async function buildContext({
  request,
  requestId,
}: YogaInitialContext & PluginContext): Promise<
  | (AdditionalContextForAuthed & AppContextForAuthed)
  | (AdditionalContextForGuest & AppContextForGuest)
> {
  const start = Date.now();

  const accessToken = request.headers
    .get("authorization") //
    ?.replace("Bearer ", "");

  let payload: AccessToken.Payload | null = null;
  if (accessToken != null) {
    const result = await AccessToken.verify(accessToken);
    switch (result.type) {
      case "Success":
        payload = result.payload;
        break;
      case "Invalid":
        throw authenticationError();
      case "Expired":
        throw tokenExpiredError();
      case "Unknown":
        throw authenticationError();
      default:
        throw new Error(result satisfies never);
    }
  }

  const logger = pino.child({ requestId });
  const kysely = createKysely(logger);
  const kyselyReadonly = kysely as unknown as ReadonlyKysely<DB>;

  let user: Context["user"] = null;
  if (payload) {
    const found = await findAppContextUser(payload.id, kysely);
    if (found == null) {
      throw authenticationError();
    }
    user = found;
  }

  if (user != null) {
    const todoRepo = new TodoRepo(kysely, user.id);
    return {
      start,
      queries: {
        todo: new TodoQuery(kyselyReadonly, todoRepo, user.id),
        user: new UserQuery(kyselyReadonly, user.id),
      },
      ...createAppContextForAuthed({ user, kysely, logger }),
    };
  } else {
    return {
      start,
      ...createAppContextForGuest({ kysely, logger }),
    };
  }
}
