import { refreshAccessToken } from "../../../../application/usecases/refresh-access-token.ts";
import { assertGuest } from "../_authorizers/guest.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    未ログインのみ
    """
    accessTokenRefresh(refreshToken: String!): AccessTokenRefreshResult
      @semanticNonNull
      @complexity(value: 50)
  }

  union AccessTokenRefreshResult =
    | AccessTokenRefreshSuccess
    | InvalidRefreshTokenError
    | RefreshTokenExpiredError
    | RefreshTokenReuseError

  type AccessTokenRefreshSuccess {
    accessToken: String!
    refreshToken: String!
  }

  type InvalidRefreshTokenError implements Error {
    message: String!
  }

  type RefreshTokenExpiredError implements Error {
    message: String!
  }

  type RefreshTokenReuseError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["accessTokenRefresh"] = async (_parent, args, ctx) => {
  assertGuest(ctx);

  const result = await refreshAccessToken(ctx, args.refreshToken);
  switch (result.type) {
    case "InvalidRefreshToken":
    case "RefreshTokenNotFound":
      return {
        __typename: "InvalidRefreshTokenError",
        message: "The refresh token is invalid. Please login.",
      };
    case "RefreshTokenExpired":
      return {
        __typename: "RefreshTokenExpiredError",
        message: "The refresh token is expired. Please login.",
      };
    case "RefreshTokenReuse":
      ctx.logger.warn({}, "refresh-token-reuse-detected");
      return {
        __typename: "RefreshTokenReuseError",
        message: "The refresh token was reused. All sessions were revoked. Please login.",
      };
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "AccessTokenRefreshSuccess",
        accessToken: result.accessToken,
        refreshToken: result.rawRefreshToken,
      };
    default:
      throw new Error(result satisfies never);
  }
};
