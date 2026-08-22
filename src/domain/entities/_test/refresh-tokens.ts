import type { RefreshTokenRepo } from "../../../infrastructure/repositories/refresh-token.ts";
import { addDates } from "../../../lib/date-immutable.ts";
import type * as Entity from "../refresh-token.ts";
import { entities as users } from "./users.ts";

export const entities = {
  alice: {
    token: "f72776c7900ec4371efd317ffccd6b5f7076958fe94a88d45da50c782a02f1e6",
    userId: users.alice.id,
    expiresAt: addDates(new Date(), 7),
    createdAt: new Date(),
  } as Entity.Type,
  bob: {
    token: "7534e7dc8061d9c1137aa2c8ba6f3a52fdb9936ec2d3b90e9be4bc2a32101300",
    userId: users.bob.id,
    expiresAt: addDates(new Date(), 7),
    createdAt: new Date(),
  } as Entity.Type,
} satisfies Record<string, Entity.Type>;

export const raws = {
  alice: "a5ef8ce5-82cd-418c-9a72-4c43cfa30c9c" as Entity.Token.Type,
  bob: "b3472488-c8b2-41a9-9ac2-860a7c327e09" as Entity.Token.Type,
} satisfies Record<string, Entity.Token.Type>;

export async function seed(repo: RefreshTokenRepo, ...entities: Entity.Type[]) {
  await Promise.all(entities.map((entity) => repo.add(entity)));
}
