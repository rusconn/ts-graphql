import { logout } from "../../../../application/usecases/logout.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    logout(
      """
      無効化するリフレッシュトークン
      """
      refreshToken: String!
    ): Void @semanticNonNull @complexity(value: 50)
  }
`;

export const resolver: MutationResolvers["logout"] = async (_parent, args, ctx) => {
  const result = await logout(ctx, args.refreshToken);
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
