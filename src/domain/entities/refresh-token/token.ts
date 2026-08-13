import type { Tagged } from "type-fest";

import { sha256 } from "../../../lib/string/hash.ts";
import * as Uuidv4 from "../../../util/uuid/v4.ts";

export type Type = Tagged<Uuidv4.Uuidv4, "RefreshToken">;
export type TypeHashed = Tagged<Type, "Hashed">;

export function create() {
  return Uuidv4.gen() as Type;
}

export function is(input: unknown): input is Type {
  return Uuidv4.is(input);
}

export async function hash(source: Type) {
  return (await sha256(source)) as TypeHashed;
}
