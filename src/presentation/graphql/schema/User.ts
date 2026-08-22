import { assertUserOwner } from "./_authorizers/user/owner.ts";
import type { UserResolvers } from "./_types.ts";
import type { NodeResolver } from "./Query/node.ts";
import * as id from "./User/id.ts";
import * as todo from "./User/todo.ts";
import * as todos from "./User/todos.ts";

export const typeDefs = [
  /* GraphQL */ `
    type User implements Node {
      """
      本人のみ
      """
      name: String @semanticNonNull

      """
      本人のみ
      """
      email: EmailAddress @semanticNonNull

      """
      本人のみ
      """
      createdAt: DateTimeISO @semanticNonNull

      """
      本人のみ
      """
      updatedAt: DateTimeISO @semanticNonNull
    }
  `,
  id.typeDef,
  todo.typeDef,
  todos.typeDef,
];

export const resolvers: UserResolvers = {
  name(parent, _args, ctx) {
    assertUserOwner(ctx, parent);
    return parent.name;
  },
  email(parent, _args, ctx) {
    assertUserOwner(ctx, parent);
    return parent.email;
  },
  createdAt(parent, _args, ctx) {
    assertUserOwner(ctx, parent);
    return parent.createdAt;
  },
  updatedAt(parent, _args, ctx) {
    assertUserOwner(ctx, parent);
    return parent.updatedAt;
  },
  id: id.resolver,
  todo: todo.resolver,
  todos: todos.resolver,
};

export const nodeResolver: NodeResolver = async (ctx, globalId) => {
  return await id
    .parseUserId(globalId)
    .asyncMap((id) => ctx.queries.user.find(id))
    .map((user) => (user ? { __typename: "User", ...user } : null));
};
