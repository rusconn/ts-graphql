import type { QueryResolvers } from "./_types.ts";
import * as node from "./Query/node.ts";
import * as viewer from "./Query/viewer.ts";

const typeDef = /* GraphQL */ `
  type Query
`;

export const typeDefs = [
  typeDef, //
  node.typeDef,
  viewer.typeDef,
];

export const resolvers: QueryResolvers = {
  node: node.resolver,
  viewer: viewer.resolver,
};
