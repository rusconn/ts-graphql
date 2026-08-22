import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { assertUserOwner } from "../_authorizers/user/owner.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import type { UserResolvers } from "../_types.ts";
import { parseTodoId } from "../Todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    """
    本人のみ
    """
    todo(id: ID!): Todo @complexity(value: 3)
  }
`;

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
