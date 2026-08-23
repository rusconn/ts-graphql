import { Result } from "neverthrow";

import { assertAuthenticated } from "../../../../app/graphql/authorizers/authenticated.ts";
import type { MutationTodoUpdateArgs } from "../../../../app/graphql/types.generated.ts";
import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { badUserInputError, internalServerError, invalidInputErrors } from "../../../shared/mod.ts";
import { updateTodo } from "../../application/usecases/update-todo.ts";
import { Entity } from "../../domain/entities/todo.ts";
import { parseTodoDescription } from "../parsers/todo/description.ts";
import { parseTodoStatus } from "../parsers/todo/status.ts";
import { parseTodoTitle } from "../parsers/todo/title.ts";
import { parseTodoId } from "../Todo/id.ts";
import type { MutationResolvers } from "../types.generated.ts";

export const resolver: MutationResolvers["todoUpdate"] = async (_parent, args, ctx) => {
  assertAuthenticated(ctx);

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputError(e);
  });

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await updateTodo(ctx, { id, ...parsed.value });
  switch (result.type) {
    case "TodoNotFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "TodoUpdateSuccess",
        todo: result.updated,
      };
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationTodoUpdateArgs) {
  return Result.combineWithAllErrors([
    parseTodoTitle(args, "title", {
      optional: true,
      nullable: false,
    }),
    parseTodoDescription(args, "description", {
      optional: true,
      nullable: false,
    }),
    parseTodoStatus(args, "status", {
      optional: true,
      nullable: false,
    }),
  ]).map(([title, description, status]) => ({
    ...(title != null && {
      title,
    }),
    ...(description != null && {
      description,
    }),
    ...(status != null && {
      status,
    }),
  }));
}

if (import.meta.vitest) {
  const { TodoStatus } = await import("../TodoStatus.ts");
  const { testParseArgs } = await import("../../../shared/test.ts");

  const id = Entity.Id.create();

  it("collapses newlines in title and preserves them in description", () => {
    const parsed = parseArgs({ id, title: "a\n\nb", description: "c\nd" });
    expect(parsed.isOk()).toBe(true);
    expect(parsed._unsafeUnwrap()).toEqual({ title: "a b", description: "c\nd" });
  });

  testParseArgs(parseArgs, {
    valids: [
      { id },
      { id, title: "foo" },
      { id, description: "bar" },
      { id, status: TodoStatus.Done },
      { id, title: "foo", description: "bar", status: TodoStatus.Done },
      { id, title: "a".repeat(Entity.Title.MAX_GRAPHEMES) },
      { id, description: "a".repeat(Entity.Description.MAX_GRAPHEMES) },
    ],
    invalids: [
      [{ id, title: null }, ["title"]],
      [{ id, description: null }, ["description"]],
      [{ id, status: null }, ["status"]],
      [{ id, title: "a".repeat(Entity.Title.MAX_GRAPHEMES + 1) }, ["title"]],
      [{ id, description: "a".repeat(Entity.Description.MAX_GRAPHEMES + 1) }, ["description"]],
      [{ id, title: null, description: null, status: null }, ["title", "description", "status"]],
    ],
  });
}
