import { CookieStore } from "@whatwg-node/cookie-store";

import type { Context } from "../../../../yoga/contexts.ts";
import * as Static from "./static.ts";

export type ContextForIT = ReturnType<(typeof contexts)[keyof typeof contexts]>;

export const contexts = {
  admin: () => ({
    ...Static.contexts.admin,
    request: {
      cookieStore: new CookieStore(""),
    },
  }),
  alice: () => ({
    ...Static.contexts.alice,
    request: {
      cookieStore: new CookieStore(""),
    },
  }),
  guest: () => ({
    ...Static.contexts.guest,
    request: {
      cookieStore: new CookieStore(""),
    },
  }),
} as const satisfies Record<
  string,
  () => Pick<Context, "role" | "user"> & {
    request: ServerPluginRequest;
  }
>;

// @whatwg-node/server-plugin-cookiesの模倣
type ServerPluginRequest = {
  cookieStore: CookieStore;
};
