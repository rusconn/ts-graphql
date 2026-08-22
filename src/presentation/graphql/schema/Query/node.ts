import type { Result } from "neverthrow";

import type { ContextForAuthed } from "../../yoga/contexts.ts";
import { assertAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import type { QueryResolvers, ResolversTypes } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    """
    ログイン済のみ
    """
    node(id: ID!): Node @complexity(value: 3)
  }
`;

export type NodeResolver = (
  ctx: ContextForAuthed,
  globalId: string,
) => Promise<
  Result<
    ({ __typename: string } & ResolversTypes["Node"]) | null, //
    `Invalid global id: ${string}`
  >
>;

export function createNodeResolver(
  nodeResolvers: readonly NodeResolver[], //
): NonNullable<QueryResolvers["node"]> {
  return async (_parent, args, ctx) => {
    assertAuthenticated(ctx);

    const results = await Promise.all(nodeResolvers.map((resolve) => resolve(ctx, args.id)));
    const result = results.find((result) => result.isOk());
    if (result != null) {
      return result.value;
    }

    throw badUserInputError(`Invalid global id: ${args.id}`);
  };
}
