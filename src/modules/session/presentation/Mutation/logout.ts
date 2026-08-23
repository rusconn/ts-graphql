import { internalServerError } from "../../../shared/mod.ts";
import { logout } from "../../application/usecases/logout.ts";
import type { MutationResolvers } from "../types.generated.ts";

export const resolver: MutationResolvers["logout"] = async (_parent, args, ctx) => {
  const result = await logout(ctx, args);
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
