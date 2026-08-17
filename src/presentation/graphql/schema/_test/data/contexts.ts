import { dtos } from "../../../../_shared/test/data/dtos.ts";
import type { Context } from "../../../yoga/contexts.ts";

export const contexts = {
  admin: {
    user: dtos.users.admin,
  },
  alice: {
    user: dtos.users.alice,
  },
  guest: {
    user: null,
  },
} as const satisfies Record<string, Pick<Context, "user">>;

export type ContextForIT = (typeof contexts)[keyof typeof contexts];
