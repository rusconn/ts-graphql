import { trace } from "@opentelemetry/api";
import type { YogaInitialContext } from "graphql-yoga";
import type { ReadonlyKysely } from "kysely/readonly";

import { AccessToken } from "../../modules/session/mod.ts";
import { authenticationError, type DB } from "../../modules/shared/mod.ts";
import { TodoQuery, TodoRepo, type ITodoQueryForAuthed } from "../../modules/todo/app.ts";
import { findAppContextUser, UserQuery, type IUserQueryForAuthed } from "../../modules/user/app.ts";
import type { AppContextForGuest, AppContextForAuthed } from "../app-contexts.ts";
import { createAppContextForGuest, createAppContextForAuthed } from "../container.ts";
import { kysely } from "../datasources/db/client.ts";
import { pino } from "../logger.ts";
import { tokenExpiredError } from "./errors/global/token-expired.ts";

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
