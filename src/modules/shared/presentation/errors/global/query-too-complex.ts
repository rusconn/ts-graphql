import { GraphQLError } from "graphql";

import { ErrorCode } from "../../ErrorCode.ts";

export function queryTooComplexError(max: number, actual: number) {
  return new GraphQLError(
    `The query is too complex: ${actual}. Maximum allowed complexity: ${max}`,
    {
      extensions: {
        code: ErrorCode.QueryTooComplex,
        http: { status: 422 },
      },
    },
  );
}
