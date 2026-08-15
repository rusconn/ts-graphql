import { logout } from "../../../../application/usecases/logout.ts";
import * as RefreshTokenCookie from "../../../_shared/session/refresh-token-cookie.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout: Void @semanticNonNull @complexity(value: 50)
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, _args, ctx) => {
  const cookie = await RefreshTokenCookie.get(ctx);
  if (!cookie) {
    return;
  }

  await RefreshTokenCookie.clear(ctx);

  const result = await logout(ctx, cookie.value);
  switch (result.type) {
    case "InvalidRefreshToken":
    case "RefreshTokenNotFound":
      return;
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return;
    default:
      throw new Error(result satisfies never);
  }
};
