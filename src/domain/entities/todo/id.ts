import type { Tagged } from "type-fest";

import * as Uuidv7 from "../../../util/uuid/v7.ts";

export type Type = Tagged<Uuidv7.Uuidv7, "TodoId">;

export function is(input: unknown): input is Type {
  return Uuidv7.is(input);
}

export function create() {
  return Uuidv7.gen() as Type;
}

export function createWithDate() {
  const id = create();
  return {
    id,
    date: date(id),
  };
}

export function date(id: Type) {
  return Uuidv7.date(id);
}
