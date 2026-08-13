import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { numGraphemes } from "../../../lib/string/num-graphemes.ts";
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
  if (!EmailAddress.is(input)) {
    return err(invalidFormatError);
  }
  if (MAX < numGraphemes(input)) {
    return err(stringLengthTooLongError);
  }

  return ok(input as Type);
}

export type ParseError =
  | InvalidFormatError //
  | StringLengthTooLongError;

export function parseOrThrow(input: string): Type {
  return parse(input)._unsafeUnwrap();
}
