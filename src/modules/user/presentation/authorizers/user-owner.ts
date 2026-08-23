import type { Context, ContextForAuthed } from "../../../../app/graphql/contexts.ts";
import { forbiddenError } from "../../../shared/mod.ts";
import type { Dto as UserDto } from "../../application/dtos/user.ts";

export function assertUserOwner(
  context: Context,
  parent: UserDto,
): asserts context is ContextForAuthed {
  if (context.user?.id !== parent.id) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts } = await import("../../../../app/graphql/test/context.ts");
  const { dtos } = await import("../../application/dtos/test/users.ts");
  const { ErrorCode } = await import("../../../shared/mod.ts");

  const allows = [
    [contexts.alice, dtos.alice],
    [contexts.bob, dtos.bob],
  ] as const;

  const denies = [
    [contexts.alice, dtos.bob],
    [contexts.bob, dtos.alice],
    [contexts.guest, dtos.alice],
    [contexts.guest, dtos.bob],
  ] as const;

  test.each(allows)("allows %#", (context, parent) => {
    expect(() => assertUserOwner(context as unknown as Context, parent)).not.toThrow();
  });

  test.each(denies)("denies %#", (context, parent) => {
    expect(() => assertUserOwner(context as unknown as Context, parent)).toThrow(
      expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
    );
  });
}
