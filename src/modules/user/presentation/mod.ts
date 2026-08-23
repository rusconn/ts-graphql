import { resolver as accountDelete } from "./Mutation/accountDelete.ts";
import { resolver as accountEmailChange } from "./Mutation/accountEmailChange.ts";
import { resolver as accountPasswordChange } from "./Mutation/accountPasswordChange.ts";
import { resolver as accountUpdate } from "./Mutation/accountUpdate.ts";
import { resolver as signupRequest } from "./Mutation/signupRequest.ts";
import { resolver as viewer } from "./Query/viewer.ts";
import type { MutationResolvers, QueryResolvers } from "./types.generated.ts";

export const Query: QueryResolvers = {
  viewer,
};

export const Mutation: MutationResolvers = {
  accountDelete,
  accountEmailChange,
  accountPasswordChange,
  accountUpdate,
  signupRequest,
};

export { resolvers as User, nodeResolver as node } from "./User.ts";
