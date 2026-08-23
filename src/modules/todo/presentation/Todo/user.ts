import { internalServerError } from "../../../shared/mod.ts";
import { assertTodoOwner } from "../authorizers/todo-owner.ts";
import type { TodoResolvers } from "../types.generated.ts";

export const resolver: NonNullable<TodoResolvers["user"]> = async (parent, _args, ctx) => {
  assertTodoOwner(ctx, parent);

  const user = await ctx.queries.user.find(parent.userId);
  if (!user) {
    throw internalServerError();
  }

  return user;
};
