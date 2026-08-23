import type { QueryResolvers } from "../types.generated.ts";

export const resolver: QueryResolvers["viewer"] = (_parent, _args, ctx) => {
  return ctx.user;
};
