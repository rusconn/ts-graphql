import * as RefreshTokenRepo from "../../../../../infrastructure/repositories/refresh-token.ts";
import { items as refreshTokens } from "../items/refresh-tokens.ts";

export const entities = {
  admin: RefreshTokenRepo.toEntity(refreshTokens.admin),
  alice: RefreshTokenRepo.toEntity(refreshTokens.alice),
};
