import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { checkStringSize } from "../../../../../lib/string/check-size.ts";
import { cleanseText } from "../../../../../lib/string/cleanse.ts";
import {
  type StringLengthTooLongError,
  type StringLengthTooShortError,
  type StringSizeTooLargeError,
  stringLengthTooLongError,
  stringLengthTooShortError,
  stringSizeTooLargeError,
} from "../../../../shared/mod.ts";

export type Name = Tagged<string, "UserName">;

export type ParseError =
  | StringLengthTooShortError //
  | StringLengthTooLongError
  | StringSizeTooLargeError;

const MAX_UTF8_BYTES = 1_000;

export const Name = {
  MIN_GRAPHEMES: 1,
  MAX_GRAPHEMES: 100,

  parse(input: string): Result<Name, ParseError> {
    const cleansed = cleanseText(input, {
      collapseWhitespace: true,
    });
    const result = checkStringSize(cleansed, {
      minGraphemes: Name.MIN_GRAPHEMES,
      maxGraphemes: Name.MAX_GRAPHEMES,
      maxUtf8Bytes: MAX_UTF8_BYTES,
    });
    switch (result.kind) {
      case "ok":
        return ok(cleansed as Name);
      case "too-short":
        return err(stringLengthTooShortError(Name.MIN_GRAPHEMES));
      case "too-long":
        return err(stringLengthTooLongError(Name.MAX_GRAPHEMES));
      case "too-large":
        return err(stringSizeTooLargeError(MAX_UTF8_BYTES));
      default:
        throw new Error(result satisfies never);
    }
  },
};
