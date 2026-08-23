import { addDates } from "../../../../../lib/date-immutable.ts";
import { users } from "../../../../user/test.ts";
import type { RefreshTokenRepo } from "../../../infrastructure/repositories/refresh-token.ts";
import type { Entity, RefreshToken } from "../refresh-token.ts";

export const entities = {
  alice: {
    token: "f72776c7900ec4371efd317ffccd6b5f7076958fe94a88d45da50c782a02f1e6",
    userId: users.entities.alice.id,
    expiresAt: addDates(new Date(), 7),
    createdAt: new Date(),
  } as Entity,
  bob: {
    token: "7534e7dc8061d9c1137aa2c8ba6f3a52fdb9936ec2d3b90e9be4bc2a32101300",
    userId: users.entities.bob.id,
    expiresAt: addDates(new Date(), 7),
    createdAt: new Date(),
  } as Entity,
} satisfies Record<string, Entity>;

export const raws = {
  alice: "a5ef8ce5-82cd-418c-9a72-4c43cfa30c9c" as RefreshToken,
  bob: "b3472488-c8b2-41a9-9ac2-860a7c327e09" as RefreshToken,
} satisfies Record<string, RefreshToken>;

export async function seed(repo: RefreshTokenRepo, ...entities: Entity[]) {
  await Promise.all(entities.map((entity) => repo.add(entity)));
}
