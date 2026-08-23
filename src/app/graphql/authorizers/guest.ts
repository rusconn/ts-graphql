import { forbiddenError } from "../../../modules/shared/mod.ts";
import type { Context, ContextForGuest } from "../contexts.ts";

export function assertGuest(context: Context): asserts context is ContextForGuest {
  if (context.user != null) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts } = await import("../test/context.ts");
  const { ErrorCode } = await import("../../../modules/shared/mod.ts");

  const allows = [contexts.guest];
  const denies = [contexts.alice, contexts.bob];

  test.each(allows)("allows %#", (context) => {
    expect(() => assertGuest(context as unknown as Context)).not.toThrow();
  });

  test.each(denies)("denies %#", (context) => {
    expect(() => assertGuest(context as unknown as Context)).toThrow(
      expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
    );
  });
}
