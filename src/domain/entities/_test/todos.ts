import type { TodoRepo } from "../../../infrastructure/repositories/todo.ts";
import * as Entity from "../todo.ts";
import { entities as users } from "./users.ts";

export const entities = {
  alice1: {
    id: "0193cb6b-0d55-711b-a11b-6eb96871a3a7",
    title: "alice todo 1",
    description: "alice todo 1",
    status: Entity.Status.PENDING,
    userId: users.alice.id,
    createdAt: new Date("2024-12-15T17:43:30.901Z"),
    updatedAt: new Date("2024-12-15T17:43:30.901Z"),
  } as Entity.Type,
  alice2: {
    id: "0193cb6b-37ae-716b-b774-a3c81db18659",
    title: "alice todo 2",
    description: "alice todo 2",
    status: Entity.Status.DONE,
    userId: users.alice.id,
    createdAt: new Date("2024-12-15T17:43:41.742Z"),
    updatedAt: new Date("2024-12-18T20:00:00.000Z"),
  } as Entity.Type,
  alice3: {
    id: "0193cb6b-5696-7022-bc97-98ecd41d1957",
    title: "alice todo 3",
    description: "alice todo 3",
    status: Entity.Status.PENDING,
    userId: users.alice.id,
    createdAt: new Date("2024-12-15T17:43:49.654Z"),
    updatedAt: new Date("2024-12-17T17:43:49.654Z"),
  } as Entity.Type,
  bob1: {
    id: "01a012d0-01a6-70fd-895c-c06a5c3c37cb",
    title: "bob todo 1",
    description: "bob todo 1",
    status: Entity.Status.PENDING,
    userId: users.bob.id,
    createdAt: new Date("2024-12-15T17:44:30.901Z"),
    updatedAt: new Date("2024-12-15T17:44:30.901Z"),
  } as Entity.Type,
} satisfies Record<string, Entity.Type>;

export async function seed(repo: TodoRepo, ...entities: Entity.Type[]) {
  await Promise.all(entities.map((entity) => repo.add(entity)));
}
