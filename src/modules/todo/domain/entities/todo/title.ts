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

export type Title = Tagged<string, "TodoTitle">;

export type ParseError =
  | StringLengthTooLongError //
  | StringSizeTooLargeError;

const MAX_UTF8_BYTES = 1_000;

export const Title = {
  MAX_GRAPHEMES: 100,

  parse(input: string): Result<Title, ParseError> {
    const cleansed = cleanseText(input, {
      collapseWhitespace: true,
    });
    const result = checkStringSize(cleansed, {
      maxGraphemes: Title.MAX_GRAPHEMES,
      maxUtf8Bytes: MAX_UTF8_BYTES,
    });
    switch (result.kind) {
      case "ok":
        return ok(cleansed as Title);
      case "too-short":
        throw new Error("unreachable");
      case "too-long":
        return err(stringLengthTooLongError(Title.MAX_GRAPHEMES));
      case "too-large":
        return err(stringSizeTooLargeError(MAX_UTF8_BYTES));
      default:
        throw new Error(result satisfies never);
    }
  },
};
