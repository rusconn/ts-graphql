import { assertTodoOwner } from "./_authorizers/todo/owner.ts";
import type { TodoResolvers } from "./_types.ts";
import type { NodeResolver } from "./Query/node.ts";
import * as id from "./Todo/id.ts";
import * as user from "./Todo/user.ts";

export const typeDefs = [
  /* GraphQL */ `
    type Todo implements Node {
      """
      所有者のみ
      """
      title: String @semanticNonNull

      """
      所有者のみ
      """
      description: String @semanticNonNull

      """
      所有者のみ
      """
      status: TodoStatus @semanticNonNull

      """
      所有者のみ
      """
      createdAt: DateTimeISO @semanticNonNull

      """
      所有者のみ
      """
      updatedAt: DateTimeISO @semanticNonNull
    }

    enum TodoStatus {
      DONE
      PENDING
    }
  `,
  id.typeDef,
  user.typeDef,
];

export const resolvers: TodoResolvers = {
  title(parent, _args, ctx) {
    assertTodoOwner(ctx, parent);
    return parent.title;
  },
  description(parent, _args, ctx) {
    assertTodoOwner(ctx, parent);
    return parent.description;
  },
  status(parent, _args, ctx) {
    assertTodoOwner(ctx, parent);
    return parent.status;
  },
  createdAt(parent, _args, ctx) {
    assertTodoOwner(ctx, parent);
    return parent.createdAt;
  },
  updatedAt(parent, _args, ctx) {
    assertTodoOwner(ctx, parent);
    return parent.updatedAt;
  },
  id: id.resolver,
  user: user.resolver,
};

export const nodeResolver: NodeResolver = async (ctx, globalId) => {
  return await id
    .parseTodoId(globalId)
    .asyncMap((id) => ctx.queries.todo.find(id))
    .map((todo) => (todo ? { __typename: "Todo", ...todo } : null));
};
