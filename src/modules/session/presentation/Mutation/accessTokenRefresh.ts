import { assertGuest } from "../../../../app/graphql/authorizers/guest.ts";
import { internalServerError } from "../../../shared/mod.ts";
import { refreshAccessToken } from "../../application/usecases/refresh-access-token.ts";
import type { MutationResolvers } from "../types.generated.ts";

export const resolver: MutationResolvers["accessTokenRefresh"] = async (_parent, args, ctx) => {
  assertGuest(ctx);

  const result = await refreshAccessToken(ctx, args);
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
