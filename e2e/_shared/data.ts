import { sign } from "../../src/presentation/_shared/session/access-token.ts";
import { refreshTokens } from "../../src/presentation/_shared/test/data/client/refresh-tokens.ts";
import * as UT from "../../src/presentation/graphql/schema/_test/data.ts";

export const items = UT.items;
export const dtos = UT.dtos;
export const entities = UT.entities;

export const clients = {
  refreshTokens,
  tokens: {
    admin: await sign(entities.users.admin),
    alice: await sign(entities.users.alice),
  },
};
