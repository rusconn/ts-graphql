import type { Context, ContextForAuthed } from "../../../yoga/contexts.ts";
import { forbiddenError } from "../../_errors/global/forbidden.ts";
import type { User } from "../../User/_mapper.ts";

export function assertUserOwner(context: Context, user: User): asserts context is ContextForAuthed {
  if (context.user?.id !== user.id) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts } = await import("../../../yoga/_test/context.ts");
  const { dtos: users } = await import("../../../../../application/dtos/_test/users.ts");
  const { ErrorCode } = await import("../../_types.ts");

  describe("assertSelfOnly", () => {
    const allows = [
      [contexts.alice, users.alice],
      [contexts.bob, users.bob],
    ] as const;

    const denies = [
      [contexts.alice, users.bob],
      [contexts.bob, users.alice],
      [contexts.guest, users.alice],
      [contexts.guest, users.bob],
    ] as const;

    test.each(allows)("allows %#", (context, user) => {
      expect(() => assertUserOwner(context as unknown as Context, user)).not.toThrow();
    });

    test.each(denies)("denies %#", (context, user) => {
      expect(() => assertUserOwner(context as unknown as Context, user)).toThrow(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
  });
}
