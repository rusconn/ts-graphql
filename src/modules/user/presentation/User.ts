import type { NodeResolver } from "../../../app/graphql/Query/node.ts";
import { assertUserOwner } from "./authorizers/user-owner.ts";
import type { UserResolvers } from "./types.generated.ts";
import * as id from "./User/id.ts";

export const resolvers: UserResolvers = {
  name(parent, _args, ctx) {
    assertUserOwner(ctx, parent);
    return parent.name;
  },
  email(parent, _args, ctx) {
    assertUserOwner(ctx, parent);
    return parent.email;
  },
  createdAt(parent, _args, ctx) {
    assertUserOwner(ctx, parent);
    return parent.createdAt;
  },
  updatedAt(parent, _args, ctx) {
    assertUserOwner(ctx, parent);
    return parent.updatedAt;
  },
  id: id.resolver,
};

export const nodeResolver: NodeResolver = async (ctx, globalId) => {
  return await id
    .parseUserId(globalId)
    .asyncMap((id) => ctx.queries.user.find(id))
    .map((user) => (user ? { __typename: "User", ...user } : null));
};
