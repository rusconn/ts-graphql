import { deleteAccount } from "../../../../application/usecases/delete-account.ts";
import { User } from "../../../../domain/entities.ts";
import { assertAuthenticated } from "../_authorizers/authenticated.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import type { MutationAccountDeleteArgs, MutationResolvers } from "../_types.ts";
import { toUserId } from "../User/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    紐づくリソースは全て削除される

    ログイン済のみ
    """
    accountDelete(
      """
      ${User.Password.MIN_GRAPHEMES}文字以上、${User.Password.MAX_GRAPHEMES}文字まで
      """
      password: String!
    ): AccountDeleteResult @semanticNonNull @complexity(value: 1000)
  }

  union AccountDeleteResult = AccountDeleteSuccess | InvalidInputErrors | IncorrectPasswordError

  type AccountDeleteSuccess {
    id: ID!
  }

  type IncorrectPasswordError implements Error {
    message: String!
  }
`;

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
  const { testParseArgs } = await import("../_test/helpers.ts");

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
