import { Result } from "neverthrow";

import { createTodo } from "../../../../application/usecases/create-todo.ts";
import { Todo } from "../../../../domain/entities.ts";
import { assertAuthenticated } from "../_authorizers/authenticated.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseTodoDescription } from "../_parsers/todo/description.ts";
import { parseTodoTitle } from "../_parsers/todo/title.ts";
import type { MutationResolvers, MutationTodoCreateArgs } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ${Todo.MAX_COUNT}件まで

    ログイン済のみ
    """
    todoCreate(
      """
      ${Todo.Title.MAX_GRAPHEMES}文字まで
      """
      title: String! = ""

      """
      ${Todo.Description.MAX_GRAPHEMES}文字まで
      """
      description: String! = ""
    ): TodoCreateResult @semanticNonNull @complexity(value: 50)
  }

  union TodoCreateResult = TodoCreateSuccess | InvalidInputErrors | ResourceLimitExceededError

  type TodoCreateSuccess {
    todo: Todo!
    todoEdge: TodoEdge!
  }
`;

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
  const { testParseArgs } = await import("../_parsers/_test/helpers.ts");

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
