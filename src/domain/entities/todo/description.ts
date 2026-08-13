import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { numGraphemes } from "../../../lib/string/num-graphemes.ts";
import { utf8ByteLength } from "../../../lib/string/utf8-byte-length.ts";
import {
  type StringLengthTooLongError,
  type StringSizeTooLargeError,
  stringLengthTooLongError,
  stringSizeTooLargeError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<string, "TodoDescription">;

export const MAX = 5_000;
const MAX_BYTES = 50_000;

export function parse(input: string): Result<Type, ParseError> {
  if (MAX < numGraphemes(input)) {
    return err(stringLengthTooLongError);
  }
  if (MAX_BYTES < utf8ByteLength(input)) {
    return err(stringSizeTooLargeError);
  }

  return ok(input as Type);
}

export type ParseError =
  | StringLengthTooLongError //
  | StringSizeTooLargeError;

export function parseOrThrow(input: Parameters<typeof parse>[0]): Type {
  return parse(input)._unsafeUnwrap();
}
