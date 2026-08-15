import { dtos } from "../../../../_shared/test/data/dtos.ts";
import type { Context } from "../../../yoga/contexts.ts";

export const contexts = {
  admin: {
    role: "ADMIN",
    user: dtos.users.admin,
  },
  alice: {
    role: "USER",
    user: dtos.users.alice,
  },
  guest: {
    role: "GUEST",
    user: null,
  },
} as const satisfies Record<string, Pick<Context, "role" | "user">>;

export type ContextForIT = (typeof contexts)[keyof typeof contexts];
