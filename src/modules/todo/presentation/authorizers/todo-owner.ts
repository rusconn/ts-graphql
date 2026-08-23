import type { Context, ContextForAuthed } from "../../../../app/graphql/contexts.ts";
import { forbiddenError } from "../../../shared/mod.ts";
import type { Dto as TodoDto } from "../../application/dtos/todo.ts";

export function assertTodoOwner(
  context: Context,
  parent: TodoDto,
): asserts context is ContextForAuthed {
  if (context.user?.id !== parent.userId) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts } = await import("../../../../app/graphql/test/context.ts");
  const { dtos } = await import("../../application/dtos/test/todos.ts");
  const { ErrorCode } = await import("../../../shared/mod.ts");

  const allows = [
    [contexts.alice, dtos.alice1],
    [contexts.bob, dtos.bob1],
  ] as const;

  const denies = [
    [contexts.alice, dtos.bob1],
    [contexts.bob, dtos.alice1],
    [contexts.guest, dtos.alice1],
    [contexts.guest, dtos.bob1],
  ] as const;

  test.each(allows)("allows %#", (context, parent) => {
    expect(() => assertTodoOwner(context as unknown as Context, parent)).not.toThrow();
  });

  test.each(denies)("denies %#", (context, parent) => {
    expect(() => assertTodoOwner(context as unknown as Context, parent)).toThrow(
      expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
    );
  });
}
