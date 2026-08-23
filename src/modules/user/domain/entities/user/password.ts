import argon2 from "argon2";
import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { checkStringSize } from "../../../../../lib/string/check-size.ts";
import {
  type StringLengthTooLongError,
  type StringLengthTooShortError,
  stringLengthTooLongError,
  stringLengthTooShortError,
} from "../../../../shared/mod.ts";
import {
  passwordHashMemoryCost,
  passwordHashParallelism,
  passwordHashTimeCost,
} from "../../../config/password-hash.ts";

export type Password = Tagged<string, "UserPassword">;
export type PasswordHashed = Tagged<string, "UserPasswordHashed">;

export type ParseError =
  | StringLengthTooShortError //
  | StringLengthTooLongError;

export const Password = {
  MIN_GRAPHEMES: 8,
  MAX_GRAPHEMES: 50,

  parse(input: string): Result<Password, ParseError> {
    const result = checkStringSize(input, {
      minGraphemes: Password.MIN_GRAPHEMES,
      maxGraphemes: Password.MAX_GRAPHEMES,
    });
    switch (result.kind) {
      case "ok":
        return ok(input as Password);
      case "too-short":
        return err(stringLengthTooShortError(Password.MIN_GRAPHEMES));
      case "too-long":
        return err(stringLengthTooLongError(Password.MAX_GRAPHEMES));
      case "too-large":
        throw new Error("unreachable");
      default:
        throw new Error(result satisfies never);
    }
  },

  async hash(source: Password): Promise<PasswordHashed> {
    const hashed = await argon2.hash(source, {
      type: argon2.argon2id,
      memoryCost: passwordHashMemoryCost,
      timeCost: passwordHashTimeCost,
      parallelism: passwordHashParallelism,
    });
    return hashed as PasswordHashed;
  },

  async match(source: Password, hashed: PasswordHashed) {
    return await argon2.verify(hashed, source);
  },
};
