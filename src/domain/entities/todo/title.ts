import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { checkStringSize } from "../../../lib/string/check-size.ts";
import {
  type StringLengthTooLongError,
  type StringSizeTooLargeError,
  stringLengthTooLongError,
  stringSizeTooLargeError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<string, "TodoTitle">;

export const MAX = 100;
const MAX_BYTES = 1_000;

export function parse(input: string): Result<Type, ParseError> {
  const result = checkStringSize(input, {
    maxGraphemes: MAX,
    maxBytes: MAX_BYTES,
  });
  switch (result.kind) {
    case "ok":
      return ok(input as Type);
    case "too-short":
      throw new Error("unreachable");
    case "too-long":
      return err(stringLengthTooLongError);
    case "too-large":
      return err(stringSizeTooLargeError);
    default:
      throw new Error(result satisfies never);
  }
}

export type ParseError =
  | StringLengthTooLongError //
  | StringSizeTooLargeError;

export function parseOrThrow(input: Parameters<typeof parse>[0]): Type {
  return parse(input)._unsafeUnwrap();
}
