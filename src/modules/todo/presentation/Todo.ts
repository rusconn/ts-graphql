import type { NodeResolver } from "../../../app/graphql/Query/node.ts";
import { assertTodoOwner } from "./authorizers/todo-owner.ts";
import * as id from "./Todo/id.ts";
import * as user from "./Todo/user.ts";
import type { TodoResolvers } from "./types.generated.ts";

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
