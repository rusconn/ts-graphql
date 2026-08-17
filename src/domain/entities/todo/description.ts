import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { checkStringSize } from "../../../lib/string/check-size.ts";
import { cleanseText } from "../../../lib/string/cleanse.ts";
import {
  type StringLengthTooLongError,
  type StringSizeTooLargeError,
  stringLengthTooLongError,
  stringSizeTooLargeError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<string, "TodoDescription">;

export const MAX = 5_000;
const MAX_UTF8_BYTES = 50_000;

export function parse(input: string): Result<Type, ParseError> {
  const cleansed = cleanseText(input);
  const result = checkStringSize(cleansed, {
    maxGraphemes: MAX,
    maxUtf8Bytes: MAX_UTF8_BYTES,
  });
  switch (result.kind) {
    case "ok":
      return ok(cleansed as Type);
    case "too-short":
      throw new Error("unreachable");
    case "too-long":
      return err(stringLengthTooLongError(MAX));
    case "too-large":
      return err(stringSizeTooLargeError(MAX_UTF8_BYTES));
    default:
      throw new Error(result satisfies never);
  }
}

export type ParseError =
  | StringLengthTooLongError //
  | StringSizeTooLargeError;
