import * as Db from "../../../../../infrastructure/datasources/db/types.ts";
import type { Uuidv7 } from "../../../../../util/uuid/v7.ts";
import { items as users } from "./users.ts";

export const items = {
  alice1: {
    id: "0193cb6b-0d55-711b-a11b-6eb96871a3a7" as Uuidv7,
    title: "alice todo 1",
    description: "alice todo 1",
    status: Db.TodoStatus.Pending,
    userId: users.alice.id,
    createdAt: new Date("2024-12-15T17:43:30.901Z"),
    updatedAt: new Date("2024-12-15T17:43:30.901Z"),
  },
  alice2: {
    id: "0193cb6b-37ae-716b-b774-a3c81db18659" as Uuidv7,
    title: "alice todo 2",
    description: "alice todo 2",
    status: Db.TodoStatus.Done,
    userId: users.alice.id,
    createdAt: new Date("2024-12-15T17:43:41.742Z"),
    updatedAt: new Date("2024-12-18T20:00:00.000Z"),
  },
  alice3: {
    id: "0193cb6b-5696-7022-bc97-98ecd41d1957" as Uuidv7,
    title: "alice todo 3",
    description: "alice todo 3",
    status: Db.TodoStatus.Pending,
    userId: users.alice.id,
    createdAt: new Date("2024-12-15T17:43:49.654Z"),
    updatedAt: new Date("2024-12-17T17:43:49.654Z"),
  },
  bob1: {
    id: "01a012d0-01a6-70fd-895c-c06a5c3c37cb" as Uuidv7,
    title: "bob todo 1",
    description: "bob todo 1",
    status: Db.TodoStatus.Pending,
    userId: users.bob.id,
    createdAt: new Date("2024-12-15T17:44:30.901Z"),
    updatedAt: new Date("2024-12-15T17:44:30.901Z"),
  },
} satisfies Record<string, Db.Todo>;
