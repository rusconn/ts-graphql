import type * as Db from "../../../../../infrastructure/datasources/db/types.ts";
import { addDates } from "../../../../../lib/date-immutable.ts";
import { db as users } from "./users.ts";

export const db = {
  admin: {
    /** raw: 33e9adb5-d716-4388-86a1-6885e6499eec */
    token: "2ca81c4db5dabe6b6067ca6bcb691640823ed6c93c9805ce239a39598471c1f9",
    userId: users.admin.id,
    expiresAt: addDates(new Date(), 7),
    createdAt: new Date(),
  },
  alice: {
    /** raw: a5ef8ce5-82cd-418c-9a72-4c43cfa30c9c */
    token: "f72776c7900ec4371efd317ffccd6b5f7076958fe94a88d45da50c782a02f1e6",
    userId: users.alice.id,
    expiresAt: addDates(new Date(), 7),
    createdAt: new Date(),
  },
} satisfies Record<string, Db.RefreshToken>;
