import type { OverrideProperties } from "type-fest";

import * as Entities from "../../../../../../domain/entities.ts";
import { entities } from "../../../../../_shared/test/data/entities/users.ts";
import type * as Graph from "../../../_types.ts";
import { userId } from "../../../User.ts";
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
    id: userId(user.id),
    name: user.name,
    email: user.email,
    createdAt: dateTimeISO(user.createdAt),
    updatedAt: dateTimeISO(user.updatedAt),
  };
}

export const nodes = {
  admin: node(entities.admin),
  alice: node(entities.alice),
};

export function dummyId() {
  return userId(Entities.User.Id.create());
}
