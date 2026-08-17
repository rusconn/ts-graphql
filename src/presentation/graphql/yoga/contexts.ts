import type { YogaInitialContext } from "graphql-yoga";
import type { ReadonlyKysely } from "kysely/readonly";

import type {
  AppContextForAdmin,
  AppContextForGuest,
  AppContextForUser,
} from "../../../application/contexts.ts";
import type { ITodoQueryForAdmin } from "../../../application/queries/todo/for-admin.ts";
import type { ITodoQueryForUser } from "../../../application/queries/todo/for-user.ts";
import type { IUserQueryForAdmin } from "../../../application/queries/user/for-admin.ts";
import type { IUserQueryForUser } from "../../../application/queries/user/for-user.ts";
import * as AccessToken from "../../../application/session/access-token.ts";
import {
  createAppContextForAdmin,
  createAppContextForGuest,
  createAppContextForUser,
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
export type ContextForAuthed = ContextForAdmin | ContextForUser;

export type ContextForAdmin = ContextBase & AdditionalContextForAdmin & AppContextForAdmin;
export type ContextForUser = ContextBase & AdditionalContextForUser & AppContextForUser;
export type ContextForGuest = ContextBase & AdditionalContextForGuest & AppContextForGuest;

type ContextBase = YogaInitialContext & PluginContext;

export type PluginContext = {
  requestId?: string;
  queryComplexity?: number;
};

type AdditionalContextForAdmin = {
  start: number;
  queries: {
    todo: ITodoQueryForAdmin;
    user: IUserQueryForAdmin;
  };
};
type AdditionalContextForUser = {
  start: number;
  queries: {
    todo: ITodoQueryForUser;
    user: IUserQueryForUser;
  };
};
type AdditionalContextForGuest = {
  start: number;
};

export async function buildContext({
  request,
  requestId,
}: YogaInitialContext & PluginContext): Promise<
  | (AdditionalContextForAdmin & AppContextForAdmin)
  | (AdditionalContextForUser & AppContextForUser)
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

  let user: Context["user"] = null;
  if (payload) {
    const found = await findAppContextUser(payload.id, kysely);
    if (found == null) {
      throw authenticationError();
    }
    user = found;
  }

  const kyselyReadonly = kysely as unknown as ReadonlyKysely<DB>;
  const logger = pino.child({ requestId });

  switch (user?.role) {
    case "ADMIN": {
      const todoRepo = new TodoRepo(kysely);
      const context = {
        start,
        queries: {
          todo: new TodoQuery(kyselyReadonly, todoRepo),
          user: new UserQuery(kyselyReadonly),
        },
        ...createAppContextForAdmin({ user, kysely, logger }),
      };
      return context;
    }
    case "USER": {
      const todoRepo = new TodoRepo(kysely, user.id);
      const context = {
        start,
        queries: {
          todo: new TodoQuery(kyselyReadonly, todoRepo, user.id),
          user: new UserQuery(kyselyReadonly, user.id),
        },
        ...createAppContextForUser({ user, kysely, logger }),
      };
      return context;
    }
    case undefined: {
      const context = {
        start,
        ...createAppContextForGuest({ kysely, logger }),
      };
      return context;
    }
  }
}
