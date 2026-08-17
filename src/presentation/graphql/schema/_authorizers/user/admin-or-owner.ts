import type { Context, ContextForAuthed } from "../../../yoga/contexts.ts";
import { forbiddenError } from "../../_errors/global/forbidden.ts";
import type { User } from "../../User/_mapper.ts";

export function assertAdminOrUserOwner(
  context: Context,
  user: User,
): asserts context is ContextForAuthed {
  if (context.user?.role !== "ADMIN" && context.user?.id !== user.id) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts: context, dtos: dto } = await import("../../_test/data.ts");
  const { ErrorCode } = await import("../../_types.ts");

  describe("assertAdminOrUserOwner", () => {
    const allows = [
      [context.admin, dto.users.admin],
      [context.admin, dto.users.alice],
      [context.alice, dto.users.alice],
    ] as const;

    const denies = [
      [context.alice, dto.users.admin],
      [context.guest, dto.users.admin],
      [context.guest, dto.users.alice],
    ] as const;

    test.each(allows)("allows %#", (context, user) => {
      expect(() => assertAdminOrUserOwner(context as unknown as Context, user)).not.toThrow();
    });

    test.each(denies)("denies %#", (context, user) => {
      expect(() => assertAdminOrUserOwner(context as unknown as Context, user)).toThrow(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
  });
}
