import { err, ok } from "neverthrow";

import type { ID } from "../../../shared/mod.ts";
import type { Dto as Todo } from "../../application/dtos/todo.ts";
import { Entity } from "../../domain/entities/todo.ts";
import { assertTodoOwner } from "../authorizers/todo-owner.ts";
import type { TodoResolvers } from "../types.generated.ts";

export const resolver: NonNullable<TodoResolvers["id"]> = (parent, _args, ctx) => {
  assertTodoOwner(ctx, parent);

  return toTodoId(parent.id);
};

export function toTodoId(id: Todo["id"]): ID {
  return `Todo:${id}` as ID;
}

export function parseTodoId(id: string) {
  const [type, internalId, ...rest] = id.split(":");

  if (type !== "Todo" || rest.length > 0 || !Entity.Id.is(internalId)) {
    return err(`Invalid global id: ${id}`);
  }

  return ok(internalId);
}

if (import.meta.vitest) {
  const internalId = Entity.Id.create();

  it("formats an id as 'Todo:<internalId>'", () => {
    expect(toTodoId(internalId)).toBe(`Todo:${internalId}`);
  });

  it("round-trips a global id produced by toTodoId", () => {
    const result = parseTodoId(toTodoId(internalId));
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(internalId);
  });

  it("rejects a global id with a foreign prefix", () => {
    expect(parseTodoId(`Fake:${internalId}`).isErr()).toBe(true);
  });

  it("rejects a global id whose internal part is not a valid id", () => {
    expect(parseTodoId("Todo:not-an-id").isErr()).toBe(true);
  });

  it("rejects a global id with extra segments", () => {
    expect(parseTodoId(`Todo:${internalId}:extra`).isErr()).toBe(true);
  });
}
