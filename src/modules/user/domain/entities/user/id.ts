import type { Tagged } from "type-fest";

import { Uuidv7 } from "../../../../shared/mod.ts";

export type Id = Tagged<Uuidv7, "UserId">;

export const Id = {
  is(input: unknown): input is Id {
    return Uuidv7.is(input);
  },

  create() {
    return Uuidv7.gen() as Id;
  },

  createWithDate() {
    const id = Id.create();
    return {
      id,
      date: Id.date(id),
    };
  },

  date(id: Id) {
    return Uuidv7.date(id);
  },
};
