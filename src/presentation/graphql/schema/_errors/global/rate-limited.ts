import { GraphQLError } from "graphql";

import { ErrorCode } from "../../_types.ts";

export type CostExtensions = {
  requestedQueryCost: number;
  throttleStatus: {
    maximumAvailable: number;
    currentlyAvailable: number;
    restoreRate: number;
  };
};

export function rateLimitedError(cost: CostExtensions) {
  return new GraphQLError("Too many requests", {
    extensions: {
      code: ErrorCode.RateLimited,
      http: { status: 429 },
      cost,
    },
  });
}
