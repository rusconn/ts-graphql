import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { checkStringSize } from "../../../lib/string/check-size.ts";
import { cleanseText } from "../../../lib/string/cleanse.ts";
import * as EmailAddress from "../../../util/email-address.ts";
import {
  type InvalidFormatError,
  invalidFormatError,
  type StringLengthTooLongError,
  stringLengthTooLongError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<EmailAddress.EmailAddress, "UserEmail">;

export const MAX = 100;

export function parse(input: string): Result<Type, ParseError> {
  const cleansed = cleanseText(input, {
    lowercase: true,
  });
  if (!EmailAddress.is(cleansed)) {
    return err(invalidFormatError);
  }
  const result = checkStringSize(cleansed, {
    maxGraphemes: MAX,
  });
  switch (result.kind) {
    case "ok":
      return ok(cleansed as Type);
    case "too-short":
    case "too-large":
      throw new Error("unreachable");
    case "too-long":
      return err(stringLengthTooLongError(MAX));
    default:
      throw new Error(result satisfies never);
  }
}

export type ParseError =
  | InvalidFormatError //
  | StringLengthTooLongError;
