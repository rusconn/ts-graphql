import * as Db from "../../../../../infrastructure/datasources/db/types.ts";
import type { Uuidv7 } from "../../../../../util/uuid/v7.ts";

export const items = {
  alice: {
    id: "0193cb69-a4be-754e-a5a0-462df1202f5e" as Uuidv7,
    name: "Alice",
    email: "alice@example.com",
    createdAt: new Date("2024-12-15T17:41:58.590Z"),
    updatedAt: new Date("2024-12-15T17:41:58.590Z"),
  },
  bob: {
    id: "01a012d0-01a3-763a-a0a1-61941f38aa42" as Uuidv7,
    name: "Bob",
    email: "bob@example.com",
    createdAt: new Date("2024-12-15T17:42:58.590Z"),
    updatedAt: new Date("2024-12-15T17:42:58.590Z"),
  },
} satisfies Record<string, Db.User>;
