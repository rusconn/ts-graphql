import type { Context, ContextForAuthed } from "../../../yoga/contexts.ts";
import { forbiddenError } from "../../_errors/global/forbidden.ts";
import type { Todo } from "../../Todo/_mapper.ts";

export function assertTodoOwner(context: Context, todo: Todo): asserts context is ContextForAuthed {
  if (context.user?.id !== todo.userId) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts: context, dtos: dto } = await import("../../_test/data.ts");
  const { ErrorCode } = await import("../../_types.ts");

  const allows = [
    [context.alice, dto.todos.alice1],
    [context.bob, dto.todos.bob1],
  ] as const;

  const denies = [
    [context.alice, dto.todos.bob1],
    [context.bob, dto.todos.alice1],
    [context.guest, dto.todos.alice1],
    [context.guest, dto.todos.bob1],
  ] as const;

  test.each(allows)("allows %#", (context, todo) => {
    expect(() => assertTodoOwner(context as unknown as Context, todo)).not.toThrow();
  });

  test.each(denies)("denies %#", (context, todo) => {
    expect(() => assertTodoOwner(context as unknown as Context, todo)).toThrow(
      expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
    );
  });
}
