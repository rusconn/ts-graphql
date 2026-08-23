import type { OverrideProperties } from "type-fest";

import type { DateTimeISO } from "../../../shared/mod.ts";
import { entities } from "../../domain/entities/test/users.ts";
import { Entity } from "../../domain/entities/user.ts";
import type * as Graph from "../types.generated.ts";
import { toUserId } from "./id.ts";

type GraphUser = OverrideProperties<
  Required<
    Pick<
      Graph.User,
      | "id" //
      | "name"
      | "email"
      | "createdAt"
      | "updatedAt"
    >
  > & {
    __typename: "User";
  },
  {
    createdAt: DateTimeISO;
    updatedAt: DateTimeISO;
  }
>;

function node(user: Entity): GraphUser {
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
