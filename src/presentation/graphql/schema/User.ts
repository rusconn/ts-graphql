import { assertUserOwner } from "./_authorizers/user/owner.ts";
import type { UserResolvers } from "./_types.ts";
import { nodeId } from "./Node/id.ts";
import * as todo from "./User/todo.ts";
import * as todos from "./User/todos.ts";

export const userId = nodeId("User");

export const typeDefs = [
  /* GraphQL */ `
    type User implements Node {
      """
      本人のみ
      """
      id: ID!

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
  todo.typeDef,
  todos.typeDef,
];

export const resolvers: UserResolvers = {
  id(parent, _args, ctx) {
    assertUserOwner(ctx, parent);
    return userId(parent.id);
  },
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
  todo: todo.resolver,
  todos: todos.resolver,
};
