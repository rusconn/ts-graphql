import { trace } from "@opentelemetry/api";
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
import { kysely } from "../../../infrastructure/datasources/db/client.ts";
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
  queryComplexity?: number;
};

type AdditionalContextForAuthed = {
  queries: {
    todo: ITodoQueryForAuthed;
    user: IUserQueryForAuthed;
  };
};
type AdditionalContextForGuest = Record<never, never>;

export async function buildContext({
  request,
}: YogaInitialContext & PluginContext): Promise<
  | (AdditionalContextForAuthed & AppContextForAuthed)
  | (AdditionalContextForGuest & AppContextForGuest)
> {
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

  let user: Context["user"] = null;
  if (payload) {
    const found = await findAppContextUser(payload.id, kysely);
    if (found == null) {
      throw authenticationError();
    }
    user = found;
  }

  trace.getActiveSpan()?.setAttribute("enduser.id", user?.id ?? "guest");

  if (user != null) {
    const kyselyReadOnly = kysely as unknown as ReadonlyKysely<DB>;
    const todoRepo = new TodoRepo(kysely, user.id);
    return {
      queries: {
        todo: new TodoQuery(kyselyReadOnly, todoRepo, user.id),
        user: new UserQuery(kyselyReadOnly, user.id),
      },
      ...createAppContextForAuthed({ user, kysely, logger: pino }),
    };
  } else {
    return {
      ...createAppContextForGuest({ kysely, logger: pino }),
    };
  }
}
