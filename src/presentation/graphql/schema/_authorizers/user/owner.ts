import type { Context, ContextForAuthed } from "../../../yoga/contexts.ts";
import { forbiddenError } from "../../_errors/global/forbidden.ts";
import type { User } from "../../User/_mapper.ts";

export function assertUserOwner(context: Context, user: User): asserts context is ContextForAuthed {
  if (context.user?.id !== user.id) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts: context, dtos: dto } = await import("../../_test/data.ts");
  const { ErrorCode } = await import("../../_types.ts");

  describe("assertSelfOnly", () => {
    const allows = [
      [context.alice, dto.users.alice],
      [context.bob, dto.users.bob],
    ] as const;

    const denies = [
      [context.alice, dto.users.bob],
      [context.bob, dto.users.alice],
      [context.guest, dto.users.alice],
      [context.guest, dto.users.bob],
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
