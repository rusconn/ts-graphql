import type { Context, ContextForAuthed } from "../../../yoga/contexts.ts";
import { forbiddenError } from "../../_errors/global/forbidden.ts";
import type { Todo } from "../../Todo/_mapper.ts";

export function assertTodoOwner(context: Context, todo: Todo): asserts context is ContextForAuthed {
  if (context.user?.id !== todo.userId) {
    throw forbiddenError();
  }
}

if (import.meta.vitest) {
  const { contexts } = await import("../../../yoga/_test/context.ts");
  const { dtos: todos } = await import("../../../../../application/dtos/_test/todos.ts");
  const { ErrorCode } = await import("../../_types.ts");

  const allows = [
    [contexts.alice, todos.alice1],
    [contexts.bob, todos.bob1],
  ] as const;

  const denies = [
    [contexts.alice, todos.bob1],
    [contexts.bob, todos.alice1],
    [contexts.guest, todos.alice1],
    [contexts.guest, todos.bob1],
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
