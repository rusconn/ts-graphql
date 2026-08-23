import type { Result } from "neverthrow";

import { badUserInputError } from "../../../modules/shared/mod.ts";
import { assertAuthenticated } from "../authorizers/authenticated.ts";
import type { ContextForAuthed } from "../contexts.ts";
import type { QueryResolvers, ResolversTypes } from "../types.generated.ts";

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
  ...nodeResolvers: readonly NodeResolver[]
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
