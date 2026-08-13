import argon2 from "argon2";
import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import {
  passwordHashMemoryCost,
  passwordHashParallelism,
  passwordHashTimeCost,
} from "../../../config/password-hash.ts";
import { checkStringSize } from "../../../lib/string/check-size.ts";
import {
  type StringLengthTooLongError,
  type StringLengthTooShortError,
  stringLengthTooLongError,
  stringLengthTooShortError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<string, "UserPassword">;
export type TypeHashed = Tagged<Type, "Hashed">;

export const MIN = 8;
export const MAX = 50;

export function parse(input: string): Result<Type, ParseError> {
  const result = checkStringSize(input, {
    minGraphemes: MIN,
    maxGraphemes: MAX,
  });
  switch (result.kind) {
    case "ok":
      return ok(input as Type);
    case "too-short":
      return err(stringLengthTooShortError(MIN));
    case "too-long":
      return err(stringLengthTooLongError(MAX));
    case "too-large":
      throw new Error("unreachable");
    default:
      throw new Error(result satisfies never);
  }
}

export type ParseError =
  | StringLengthTooShortError //
  | StringLengthTooLongError;

export async function hash(source: Type) {
  const hashed = await argon2.hash(source, {
    type: argon2.argon2id,
    memoryCost: passwordHashMemoryCost,
    timeCost: passwordHashTimeCost,
    parallelism: passwordHashParallelism,
  });
  return hashed as TypeHashed;
}

export async function match(source: Type, hashed: TypeHashed) {
  return await argon2.verify(hashed, source);
}
