import { dtos } from "../../../../_shared/test/data/dtos.ts";
import type { Context } from "../../../yoga/contexts.ts";

export const contexts = {
  alice: {
    user: dtos.users.alice,
  },
  bob: {
    user: dtos.users.bob,
  },
  guest: {
    user: null,
  },
} as const satisfies Record<string, Pick<Context, "user">>;

export type ContextForIT = (typeof contexts)[keyof typeof contexts];
