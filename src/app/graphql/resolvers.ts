import * as session from "../../modules/session/app.ts";
import { DateTimeISO, EmailAddress, Void } from "../../modules/shared/app.ts";
import * as todo from "../../modules/todo/app.ts";
import * as user from "../../modules/user/app.ts";
import * as nodeResolver from "./Query/node.ts";
import type { Resolvers } from "./types.generated.ts";

export const resolvers: Resolvers = {
  DateTimeISO: DateTimeISO.resolver,
  EmailAddress: EmailAddress.resolver,
  Void: Void.resolver,
  Query: {
    node: nodeResolver.createNodeResolver(
      todo.node, //
      user.node,
    ),
    ...user.Query,
  },
  Mutation: {
    ...session.Mutation,
    ...todo.Mutation,
    ...user.Mutation,
  },
  Todo: todo.Todo,
  User: {
    ...todo.User,
    ...user.User,
  },
};
