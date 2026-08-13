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

export type Type = Tagged<string, "TodoTitle">;

export const MAX = 100;
const MAX_BYTES = 1_000;

export function parse(input: string): Result<Type, ParseError> {
  const cleansed = cleanseText(input, {
    collapseWhitespace: true,
  });
  const result = checkStringSize(cleansed, {
    maxGraphemes: MAX,
    maxBytes: MAX_BYTES,
  });
  switch (result.kind) {
    case "ok":
      return ok(cleansed as Type);
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
