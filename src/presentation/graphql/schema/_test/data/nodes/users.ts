import type { OverrideProperties } from "type-fest";

import * as Entities from "../../../../../../domain/entities.ts";
import { entities } from "../../../../../_shared/test/data/entities/users.ts";
import type * as Graph from "../../../_types.ts";
import { toUserId } from "../../../User/id.ts";
import { type DateTimeISO, dateTimeISO } from "./_shared.ts";

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

function node(user: Entities.User.Type): GraphUser {
  return {
    __typename: "User",
    id: toUserId(user.id),
    name: user.name,
    email: user.email,
    createdAt: dateTimeISO(user.createdAt),
    updatedAt: dateTimeISO(user.updatedAt),
  };
}

export const nodes = {
  alice: node(entities.alice),
  bob: node(entities.bob),
};

export function dummyId() {
  return toUserId(Entities.User.Id.create());
}
