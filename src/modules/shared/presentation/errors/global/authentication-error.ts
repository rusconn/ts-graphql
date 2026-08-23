import { GraphQLError } from "graphql";

import { ErrorCode } from "../../ErrorCode.ts";

export function authenticationError() {
  return new GraphQLError("Authentication error", {
    extensions: {
      code: ErrorCode.AuthenticationError,
      http: { status: 401 },
    },
  });
}
