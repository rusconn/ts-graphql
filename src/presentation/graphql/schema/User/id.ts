import { err, ok } from "neverthrow";

import * as Entity from "../../../../domain/entities/user.ts";
import { assertUserOwner } from "../_authorizers/user/owner.ts";
import type { UserResolvers } from "../_types.ts";
import type { ID } from "../ID";
import type { User } from "./_mapper.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    """
    所有者のみ
    """
    id: ID!
  }
`;

export const resolver: NonNullable<UserResolvers["id"]> = (parent, _args, ctx) => {
  assertUserOwner(ctx, parent);

  return toUserId(parent.id);
};

export function toUserId(id: User["id"]): ID {
  return `User:${id}` as ID;
}

export function parseUserId(id: string) {
  const [type, internalId, ...rest] = id.split(":");

  if (type !== "User" || rest.length > 0 || !Entity.Id.is(internalId)) {
    return err(`Invalid global id: ${id}`);
  }

  return ok(internalId);
}

if (import.meta.vitest) {
  const internalId = Entity.Id.create();

  it("formats an id as 'User:<internalId>'", () => {
    expect(toUserId(internalId)).toBe(`User:${internalId}`);
  });

  it("round-trips a global id produced by toUserId", () => {
    const result = parseUserId(toUserId(internalId));
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(internalId);
  });

  it("rejects a global id with a foreign prefix", () => {
    expect(parseUserId(`Fake:${internalId}`).isErr()).toBe(true);
  });

  it("rejects a global id whose internal part is not a valid id", () => {
    expect(parseUserId("User:not-an-id").isErr()).toBe(true);
  });

  it("rejects a global id with extra segments", () => {
    expect(parseUserId(`User:${internalId}:extra`).isErr()).toBe(true);
  });
}
