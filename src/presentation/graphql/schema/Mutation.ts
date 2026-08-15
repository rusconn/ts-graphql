import type { MutationResolvers } from "./_types.ts";
import * as accessTokenRefresh from "./Mutation/accessTokenRefresh.ts";
import * as accountDelete from "./Mutation/accountDelete.ts";
import * as accountEmailChange from "./Mutation/accountEmailChange.ts";
import * as accountPasswordChange from "./Mutation/accountPasswordChange.ts";
import * as accountUpdate from "./Mutation/accountUpdate.ts";
import * as login from "./Mutation/login.ts";
import * as logout from "./Mutation/logout.ts";
import * as signup from "./Mutation/signup.ts";
import * as todoCreate from "./Mutation/todoCreate.ts";
import * as todoDelete from "./Mutation/todoDelete.ts";
import * as todoStatusChange from "./Mutation/todoStatusChange.ts";
import * as todoUpdate from "./Mutation/todoUpdate.ts";

const typeDef = /* GraphQL */ `
  type Mutation
`;

export const typeDefs = [
  typeDef,
  accessTokenRefresh.typeDef,
  accountDelete.typeDef,
  accountEmailChange.typeDef,
  accountPasswordChange.typeDef,
  accountUpdate.typeDef,
  login.typeDef,
  logout.typeDef,
  signup.typeDef,
  todoCreate.typeDef,
  todoDelete.typeDef,
  todoStatusChange.typeDef,
  todoUpdate.typeDef,
];

export const resolvers: MutationResolvers = {
  accessTokenRefresh: accessTokenRefresh.resolver,
  accountDelete: accountDelete.resolver,
  accountEmailChange: accountEmailChange.resolver,
  accountPasswordChange: accountPasswordChange.resolver,
  accountUpdate: accountUpdate.resolver,
  login: login.resolver,
  logout: logout.resolver,
  signup: signup.resolver,
  todoCreate: todoCreate.resolver,
  todoDelete: todoDelete.resolver,
  todoStatusChange: todoStatusChange.resolver,
  todoUpdate: todoUpdate.resolver,
};
