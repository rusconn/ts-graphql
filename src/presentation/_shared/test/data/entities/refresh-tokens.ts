import * as RefreshTokenRepo from "../../../../../infrastructure/repositories/refresh-token.ts";
import { items as refreshTokens } from "../items/refresh-tokens.ts";

export const entities = {
  alice: RefreshTokenRepo.toEntity(refreshTokens.alice),
  bob: RefreshTokenRepo.toEntity(refreshTokens.bob),
};
