import { Result } from "neverthrow";

import { assertAuthenticated } from "../../../../app/graphql/authorizers/authenticated.ts";
import type { MutationTodoCreateArgs } from "../../../../app/graphql/types.generated.ts";
import { internalServerError, invalidInputErrors } from "../../../shared/mod.ts";
import { createTodo } from "../../application/usecases/create-todo.ts";
import { Entity as Todo } from "../../domain/entities/todo.ts";
import { parseTodoDescription } from "../parsers/todo/description.ts";
import { parseTodoTitle } from "../parsers/todo/title.ts";
import type { MutationResolvers } from "../types.generated.ts";

export const resolver: MutationResolvers["todoCreate"] = async (_parent, args, ctx) => {
  assertAuthenticated(ctx);

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await createTodo(ctx, {
    userId: ctx.user.id,
    ...parsed.value,
  });
  switch (result.type) {
    case "TodoCountLimitExceeded":
      return {
        __typename: "ResourceLimitExceededError",
        message: `The number of todos exceeds the maximum number of ${result.limit}.`,
      };
    case "UserNotFound":
      throw internalServerError();
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "TodoCreateSuccess",
        todo: result.created,
        todoEdge: {
          cursor: result.created.id,
          node: result.created,
        },
      };
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationTodoCreateArgs) {
  return Result.combineWithAllErrors([
    parseTodoTitle(args, "title", {
      optional: false,
      nullable: false,
    }),
    parseTodoDescription(args, "description", {
      optional: false,
      nullable: false,
    }),
  ]).map(([title, description]) => ({
    title,
    description,
  }));
}

if (import.meta.vitest) {
  const { testParseArgs } = await import("../../../shared/test.ts");

  it("cleanses title and preserves newlines in description", () => {
    const parsed = parseArgs({ title: "  foo  ", description: "bar\nbaz" });
    expect(parsed.isOk()).toBe(true);
    expect(parsed._unsafeUnwrap()).toEqual({ title: "foo", description: "bar\nbaz" });
  });

  const validArgs: MutationTodoCreateArgs = {
    title: "foo",
    description: "bar",
  };

  const invalidArgs: MutationTodoCreateArgs = {
    title: "a".repeat(Todo.Title.MAX_GRAPHEMES + 1),
    description: "a".repeat(Todo.Description.MAX_GRAPHEMES + 1),
  };

  testParseArgs(parseArgs, {
    valids: [
      { ...validArgs },
      { ...validArgs, title: "a".repeat(Todo.Title.MAX_GRAPHEMES) },
      { ...validArgs, description: "a".repeat(Todo.Description.MAX_GRAPHEMES) },
    ],
    invalids: [
      [{ ...validArgs, title: invalidArgs.title }, ["title"]],
      [{ ...validArgs, description: invalidArgs.description }, ["description"]],
      [{ ...validArgs, ...invalidArgs }, ["title", "description"]],
    ],
  });
}
