import { assertAuthenticated } from "../../../../app/graphql/authorizers/authenticated.ts";
import type { MutationAccountDeleteArgs } from "../../../../app/graphql/types.generated.ts";
import { internalServerError, invalidInputErrors } from "../../../shared/mod.ts";
import { deleteAccount } from "../../application/usecases/delete-account.ts";
import { Entity as User } from "../../domain/entities/user.ts";
import { parseUserPassword } from "../parsers/user/password.ts";
import type { MutationResolvers } from "../types.generated.ts";
import { toUserId } from "../User/id.ts";

export const resolver: MutationResolvers["accountDelete"] = async (_parent, args, ctx) => {
  assertAuthenticated(ctx);

  const password = parseArgs(args);
  if (password.isErr()) {
    return invalidInputErrors([password.error]);
  }

  const result = await deleteAccount(ctx, {
    userId: ctx.user.id,
    password: password.value,
  });
  switch (result.type) {
    case "AccountNotFound":
      throw internalServerError();
    case "IncorrectPassword":
      return {
        __typename: "IncorrectPasswordError",
        message: "The password is incorrect.",
      };
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "AccountDeleteSuccess",
        id: toUserId(ctx.user.id),
      };
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationAccountDeleteArgs) {
  return parseUserPassword(args, "password", {
    optional: false,
    nullable: false,
  });
}

if (import.meta.vitest) {
  const { testParseArgs } = await import("../../../shared/test.ts");

  testParseArgs(parseArgs, {
    valids: [
      { password: "password" }, //
      { password: "a".repeat(User.Password.MIN_GRAPHEMES) },
    ],
    invalids: [
      [{ password: "a".repeat(User.Password.MIN_GRAPHEMES - 1) }, ["password"]],
      [{ password: "a".repeat(User.Password.MAX_GRAPHEMES + 1) }, ["password"]],
    ],
  });
}
