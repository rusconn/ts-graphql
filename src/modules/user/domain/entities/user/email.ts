import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { checkStringSize } from "../../../../../lib/string/check-size.ts";
import { cleanseText } from "../../../../../lib/string/cleanse.ts";
import {
  type InvalidFormatError,
  invalidFormatError,
  type StringLengthTooLongError,
  stringLengthTooLongError,
  EmailAddress,
} from "../../../../shared/mod.ts";

export type Email = Tagged<EmailAddress, "UserEmail">;

export type ParseError =
  | InvalidFormatError //
  | StringLengthTooLongError;

export const Email = {
  MAX_GRAPHEMES: 100,

  parse(input: string): Result<Email, ParseError> {
    const cleansed = cleanseText(input, {
      lowercase: true,
    });
    if (!EmailAddress.is(cleansed)) {
      return err(invalidFormatError);
    }
    const result = checkStringSize(cleansed, {
      maxGraphemes: Email.MAX_GRAPHEMES,
    });
    switch (result.kind) {
      case "ok":
        return ok(cleansed as Email);
      case "too-short":
      case "too-large":
        throw new Error("unreachable");
      case "too-long":
        return err(stringLengthTooLongError(Email.MAX_GRAPHEMES));
      default:
        throw new Error(result satisfies never);
    }
  },
};
