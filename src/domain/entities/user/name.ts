import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { checkStringSize } from "../../../lib/string/check-size.ts";
import { cleanseText } from "../../../lib/string/cleanse.ts";
import {
  type StringLengthTooLongError,
  type StringLengthTooShortError,
  type StringSizeTooLargeError,
  stringLengthTooLongError,
  stringLengthTooShortError,
  stringSizeTooLargeError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<string, "UserName">;

export const MIN_GRAPHEMES = 1;
export const MAX_GRAPHEMES = 100;
const MAX_UTF8_BYTES = 1_000;

export function parse(input: string): Result<Type, ParseError> {
  const cleansed = cleanseText(input, {
    collapseWhitespace: true,
  });
  const result = checkStringSize(cleansed, {
    minGraphemes: MIN_GRAPHEMES,
    maxGraphemes: MAX_GRAPHEMES,
    maxUtf8Bytes: MAX_UTF8_BYTES,
  });
  switch (result.kind) {
    case "ok":
      return ok(cleansed as Type);
    case "too-short":
      return err(stringLengthTooShortError(MIN_GRAPHEMES));
    case "too-long":
      return err(stringLengthTooLongError(MAX_GRAPHEMES));
    case "too-large":
      return err(stringSizeTooLargeError(MAX_UTF8_BYTES));
    default:
      throw new Error(result satisfies never);
  }
}

export type ParseError =
  | StringLengthTooShortError //
  | StringLengthTooLongError
  | StringSizeTooLargeError;
