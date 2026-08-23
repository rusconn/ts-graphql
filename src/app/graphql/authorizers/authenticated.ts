import { forbiddenError } from "../../../modules/shared/mod.ts";
import type { Context, ContextForAuthed } from "../contexts.ts";

export function assertAuthenticated(context: Context): asserts context is ContextForAuthed {
  if (context.user == null) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts } = await import("../test/context.ts");
  const { ErrorCode } = await import("../../../modules/shared/mod.ts");

  const allows = [contexts.alice, contexts.bob];
  const denies = [contexts.guest];

  test.each(allows)("allows %#", (context) => {
    expect(() => assertAuthenticated(context as unknown as Context)).not.toThrow();
  });

  test.each(denies)("denies %#", (context) => {
    expect(() => assertAuthenticated(context as unknown as Context)).toThrow(
      expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
    );
  });
}
