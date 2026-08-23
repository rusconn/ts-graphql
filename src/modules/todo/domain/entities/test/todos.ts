import { users } from "../../../../user/test.ts";
import type { TodoRepo } from "../../../infrastructure/repositories/todo.ts";
import { Entity } from "../todo.ts";

export const entities = {
  alice1: {
    id: "0193cb6b-0d55-711b-a11b-6eb96871a3a7",
    title: "alice todo 1",
    description: "alice todo 1",
    status: Entity.Status.PENDING,
    userId: users.entities.alice.id,
    createdAt: new Date("2024-12-15T17:43:30.901Z"),
    updatedAt: new Date("2024-12-15T17:43:30.901Z"),
  } as Entity,
  alice2: {
    id: "0193cb6b-37ae-716b-b774-a3c81db18659",
    title: "alice todo 2",
    description: "alice todo 2",
    status: Entity.Status.DONE,
    userId: users.entities.alice.id,
    createdAt: new Date("2024-12-15T17:43:41.742Z"),
    updatedAt: new Date("2024-12-18T20:00:00.000Z"),
  } as Entity,
  alice3: {
    id: "0193cb6b-5696-7022-bc97-98ecd41d1957",
    title: "alice todo 3",
    description: "alice todo 3",
    status: Entity.Status.PENDING,
    userId: users.entities.alice.id,
    createdAt: new Date("2024-12-15T17:43:49.654Z"),
    updatedAt: new Date("2024-12-17T17:43:49.654Z"),
  } as Entity,
  bob1: {
    id: "01a012d0-01a6-70fd-895c-c06a5c3c37cb",
    title: "bob todo 1",
    description: "bob todo 1",
    status: Entity.Status.PENDING,
    userId: users.entities.bob.id,
    createdAt: new Date("2024-12-15T17:44:30.901Z"),
    updatedAt: new Date("2024-12-15T17:44:30.901Z"),
  } as Entity,
} satisfies Record<string, Entity>;

export async function seed(repo: TodoRepo, ...entities: Entity[]) {
  await Promise.all(entities.map((entity) => repo.add(entity)));
}
