import type { OverrideProperties } from "type-fest";

import { entities } from "../../../../domain/entities/_test/users.ts";
import * as Entity from "../../../../domain/entities/user.ts";
import type * as Graph from "../_types.ts";
import type { DateTimeISO } from "../DateTimeISO.ts";
import { toUserId } from "./id.ts";

type GraphUser = OverrideProperties<
  Required<
    Pick<
      Graph.User,
      | "__typename" //
      | "id"
      | "name"
      | "email"
      | "createdAt"
      | "updatedAt"
    >
  >,
  {
    createdAt: DateTimeISO;
    updatedAt: DateTimeISO;
  }
>;

function node(user: Entity.Type): GraphUser {
  return {
    __typename: "User",
    id: toUserId(user.id),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString() as DateTimeISO,
    updatedAt: user.updatedAt.toISOString() as DateTimeISO,
  };
}

export const nodes = {
  alice: node(entities.alice),
  bob: node(entities.bob),
};

export function dummyId() {
  return toUserId(Entity.Id.create());
}

export * from "../../../../domain/entities/_test/users.ts";
export * from "../../../../application/dtos/_test/users.ts";
export * from "../../../../infrastructure/datasources/db/_test/users.ts";
