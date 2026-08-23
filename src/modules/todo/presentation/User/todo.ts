import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { badUserInputError } from "../../../shared/mod.ts";
import { assertUserOwner } from "../../../user/mod.ts";
import { parseTodoId } from "../Todo/id.ts";
import type { UserResolvers } from "../types.generated.ts";

export const resolver: NonNullable<UserResolvers["todo"]> = async (parent, args, ctx) => {
  assertUserOwner(ctx, parent);

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputError(e);
  });

  const todo = await ctx.queries.todo.findByUser({
    id,
    userId: parent.id,
  });

  return todo ?? null;
};
