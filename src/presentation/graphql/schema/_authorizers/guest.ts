import type { Context, ContextForGuest } from "../../yoga/contexts.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";

export function assertGuest(context: Context): asserts context is ContextForGuest {
  if (context.user != null) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts: context } = await import("../_test/data.ts");
  const { ErrorCode } = await import("../_types.ts");

  const allows = [context.guest];
  const denies = [context.admin, context.alice];

  test.each(allows)("allows %#", (context) => {
    expect(() => assertGuest(context as unknown as Context)).not.toThrow();
  });

  test.each(denies)("denies %#", (context) => {
    expect(() => assertGuest(context as unknown as Context)).toThrow(
      expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
    );
  });
}
