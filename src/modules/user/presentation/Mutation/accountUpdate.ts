import { Result } from "neverthrow";

import { assertAuthenticated } from "../../../../app/graphql/authorizers/authenticated.ts";
import type { MutationAccountUpdateArgs } from "../../../../app/graphql/types.generated.ts";
import { internalServerError, invalidInputErrors } from "../../../shared/mod.ts";
import { updateAccount } from "../../application/usecases/update-account.ts";
import { Entity as User } from "../../domain/entities/user.ts";
import { parseUserName } from "../parsers/user/name.ts";
import type { MutationResolvers } from "../types.generated.ts";

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
  const { testParseArgs } = await import("../../../shared/test.ts");

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
