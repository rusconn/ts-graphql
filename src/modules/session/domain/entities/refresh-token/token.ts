import type { Tagged } from "type-fest";

import { sha256 } from "../../../../../lib/string/hash.ts";
import { Uuidv4 } from "../../../../shared/mod.ts";

export type Token = Tagged<Uuidv4, "RefreshToken">;
export type TokenHashed = Tagged<string, "RefreshTokenHashed">;

export const Token = {
  create() {
    return Uuidv4.gen() as Token;
  },

  is(input: unknown): input is Token {
    return Uuidv4.is(input);
  },

  async hash(source: Token): Promise<TokenHashed> {
    return (await sha256(source)) as TokenHashed;
  },
};
