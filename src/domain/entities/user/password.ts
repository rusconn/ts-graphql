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
  type InvalidFormatError,
  type StringLengthTooLongError,
  type StringLengthTooShortError,
  invalidFormatError,
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
      return err(stringLengthTooShortError);
    case "too-long":
      return err(stringLengthTooLongError);
    case "too-large":
      throw new Error("unreachable");
    default:
      throw new Error(result satisfies never);
  }
}

export type ParseError =
  | StringLengthTooShortError //
  | StringLengthTooLongError;

export function parseOrThrow(input: Parameters<typeof parse>[0]): Type {
  return parse(input)._unsafeUnwrap();
}

export function parseHashed(input: string): Result<TypeHashed, ParseHashedError> {
  if (!ARGON2ID_REGEX.test(input)) {
    return err(invalidFormatError);
  }

  return ok(input as TypeHashed);
}

const ARGON2ID_REGEX =
  /^\$argon2id\$v=19\$m=\d+,p=\d+,t=\d+\$[A-Za-z0-9+/]{22}\$[A-Za-z0-9+/]{43}$/;

export type ParseHashedError = InvalidFormatError;

export function parseHashedOrThrow(input: string): TypeHashed {
  return parseHashed(input)._unsafeUnwrap();
}

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
