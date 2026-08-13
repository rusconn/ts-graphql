import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { numGraphemes } from "../../../lib/string/num-graphemes.ts";
import { utf8ByteLength } from "../../../lib/string/utf8-byte-length.ts";
import {
  type StringLengthTooLongError,
  type StringLengthTooShortError,
  type StringSizeTooLargeError,
  stringLengthTooLongError,
  stringLengthTooShortError,
  stringSizeTooLargeError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<string, "UserName">;

export const MIN = 1;
export const MAX = 100;
const MAX_BYTES = 1_000;

export function parse(input: string): Result<Type, ParseError> {
  const graphemes = numGraphemes(input);
  if (graphemes < MIN) {
    return err(stringLengthTooShortError);
  }
  if (MAX < graphemes) {
    return err(stringLengthTooLongError);
  }
  if (MAX_BYTES < utf8ByteLength(input)) {
    return err(stringSizeTooLargeError);
  }

  return ok(input as Type);
}

export type ParseError =
  | StringLengthTooShortError //
  | StringLengthTooLongError
  | StringSizeTooLargeError;

export function parseOrThrow(input: string): Type {
  return parse(input)._unsafeUnwrap();
}
