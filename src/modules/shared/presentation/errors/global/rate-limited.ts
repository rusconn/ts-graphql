import { GraphQLError } from "graphql";

import { ErrorCode } from "../../ErrorCode.ts";
import type { CostExtensions } from "../../rate-limit/cost.ts";

export function rateLimitedError(cost: CostExtensions) {
  return new GraphQLError("Too many requests", {
    extensions: {
      code: ErrorCode.RateLimited,
      http: { status: 429 },
      cost,
    },
  });
}
