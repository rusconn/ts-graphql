import { assertTodoOwner } from "../_authorizers/todo/owner.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { TodoResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    """
    所有者のみ
    """
    user: User @semanticNonNull @complexity(value: 3)
  }
`;

export const resolver: NonNullable<TodoResolvers["user"]> = async (parent, _args, ctx) => {
  assertTodoOwner(ctx, parent);

  const user = await ctx.queries.user.find(parent.userId);
  if (!user) {
    throw internalServerError();
  }

  return user;
};
