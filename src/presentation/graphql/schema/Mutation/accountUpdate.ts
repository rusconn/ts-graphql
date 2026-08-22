import { Result } from "neverthrow";

import { updateAccount } from "../../../../application/usecases/update-account.ts";
import * as User from "../../../../domain/entities/user.ts";
import { assertAuthenticated } from "../_authorizers/authenticated.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserName } from "../_parsers/user/name.ts";
import type { MutationAccountUpdateArgs, MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ログイン済のみ
    """
    accountUpdate(
      """
      ${User.Name.MIN_GRAPHEMES}文字以上、${User.Name.MAX_GRAPHEMES}文字まで、null は入力エラー
      """
      name: String
    ): AccountUpdateResult @semanticNonNull @complexity(value: 50)
  }

  union AccountUpdateResult = AccountUpdateSuccess | InvalidInputErrors

  type AccountUpdateSuccess {
    user: User!
  }
`;

export const resolver: MutationResolvers["accountUpdate"] = async (_parent, args, ctx) => {
  assertAuthenticated(ctx);

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await updateAccount(ctx, {
    userId: ctx.user.id,
    ...parsed.value,
  });
  switch (result.type) {
    case "AccountNotFound":
      throw internalServerError();
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "AccountUpdateSuccess",
        user: result.updated,
      };
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationAccountUpdateArgs) {
  return Result.combineWithAllErrors([
    parseUserName(args, "name", {
      optional: true,
      nullable: false,
    }),
  ]).map(([name]) => ({
    ...(name != null && {
      name,
    }),
  }));
}

if (import.meta.vitest) {
  const { testParseArgs } = await import("../_parsers/_test/helpers.ts");

  it("cleanses name", () => {
    const parsed = parseArgs({ name: " ＡＢＣ " });
    expect(parsed.isOk()).toBe(true);
    expect(parsed._unsafeUnwrap()).toEqual({ name: "ABC" });
  });

  it("collapses newlines in name", () => {
    const parsed = parseArgs({ name: "a\n\nb" });
    expect(parsed.isOk()).toBe(true);
    expect(parsed._unsafeUnwrap()).toEqual({ name: "a b" });
  });

  testParseArgs(parseArgs, {
    valids: [
      {}, //
      { name: "a".repeat(User.Name.MIN_GRAPHEMES) },
      { name: "a".repeat(User.Name.MAX_GRAPHEMES) },
    ],
    invalids: [
      [{ name: null }, ["name"]],
      [{ name: "a".repeat(User.Name.MIN_GRAPHEMES - 1) }, ["name"]],
      [{ name: "a".repeat(User.Name.MAX_GRAPHEMES + 1) }, ["name"]],
    ],
  });
}
