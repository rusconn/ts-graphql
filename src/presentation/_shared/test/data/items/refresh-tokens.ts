import type * as Db from "../../../../../infrastructure/datasources/db/types.ts";
import { addDates } from "../../../../../lib/date-immutable.ts";
import { items as users } from "./users.ts";

export const items = {
  alice: {
    /** raw: a5ef8ce5-82cd-418c-9a72-4c43cfa30c9c */
    token: "f72776c7900ec4371efd317ffccd6b5f7076958fe94a88d45da50c782a02f1e6",
    userId: users.alice.id,
    expiresAt: addDates(new Date(), 7),
    createdAt: new Date(),
  },
  bob: {
    /** raw: 355f4efdd21c95158c21505515f4c2df8971f29cae4e4b620f350a45ce5c3dbb */
    token: "d17748cbc6e1de8b3c282d96351beefe5074d26f9459792242f7b092f8730df5",
    userId: users.bob.id,
    expiresAt: addDates(new Date(), 7),
    createdAt: new Date(),
  },
} satisfies Record<string, Db.RefreshToken>;
