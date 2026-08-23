import { resolver as accessTokenRefresh } from "./Mutation/accessTokenRefresh.ts";
import { resolver as login } from "./Mutation/login.ts";
import { resolver as logout } from "./Mutation/logout.ts";
import { resolver as signupComplete } from "./Mutation/signupComplete.ts";
import type { MutationResolvers } from "./types.generated.ts";

export const Mutation: MutationResolvers = {
  accessTokenRefresh,
  login,
  logout,
  signupComplete,
};
