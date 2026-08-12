import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { sha256 } from "../../../lib/string/hash.ts";
import * as Uuidv4 from "../../../util/uuid/v4.ts";
import { type InvalidFormatError, invalidFormatError } from "../_shared/parse-errors.ts";

export type Type = Tagged<Uuidv4.Uuidv4, "RefreshToken">;
export type TypeHashed = Tagged<Type, "Hashed">;

export function parseHashed(input: string): Result<TypeHashed, ParseHashedError> {
  if (!HASHED_REGEX.test(input)) {
    return err(invalidFormatError);
  }

  return ok(input as TypeHashed);
}

const HASHED_REGEX = /^[a-f0-9]{64}$/;

export type ParseHashedError = InvalidFormatError;

export function create() {
  return Uuidv4.gen() as Type;
}

export function is(input: unknown): input is Type {
  return Uuidv4.is(input);
}

export async function hash(source: Type) {
  return (await sha256(source)) as TypeHashed;
}
