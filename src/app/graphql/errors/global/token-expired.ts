import { GraphQLError } from "graphql";

import { toError } from "../../../../lib/error.ts";
import { ErrorCode } from "../../../../modules/shared/mod.ts";

export function tokenExpiredError(cause?: unknown) {
  return new GraphQLError("The access token has expired, please refresh the token.", {
    extensions: {
      code: ErrorCode.AccessTokenExpired,
      http: { status: 401 },
    },
    ...(cause != null && {
      originalError: toError(cause),
    }),
  });
}
