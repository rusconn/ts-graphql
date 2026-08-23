import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { checkStringSize } from "../../../../../lib/string/check-size.ts";
import { cleanseText } from "../../../../../lib/string/cleanse.ts";
import {
  type StringLengthTooLongError,
  type StringSizeTooLargeError,
  stringLengthTooLongError,
  stringSizeTooLargeError,
} from "../../../../shared/mod.ts";

export type Description = Tagged<string, "TodoDescription">;

export type ParseError =
  | StringLengthTooLongError //
  | StringSizeTooLargeError;

const MAX_UTF8_BYTES = 50_000;

export const Description = {
  MAX_GRAPHEMES: 5_000,

  parse(input: string): Result<Description, ParseError> {
    const cleansed = cleanseText(input);
    const result = checkStringSize(cleansed, {
      maxGraphemes: Description.MAX_GRAPHEMES,
      maxUtf8Bytes: MAX_UTF8_BYTES,
    });
    switch (result.kind) {
      case "ok":
        return ok(cleansed as Description);
      case "too-short":
        throw new Error("unreachable");
      case "too-long":
        return err(stringLengthTooLongError(Description.MAX_GRAPHEMES));
      case "too-large":
        return err(stringSizeTooLargeError(MAX_UTF8_BYTES));
      default:
        throw new Error(result satisfies never);
    }
  },
};
