import { Result } from "neverthrow";

import { changeAccountPassword } from "../../../../application/usecases/change-account-password.ts";
import * as User from "../../../../domain/entities/user.ts";
import { assertAuthenticated } from "../_authorizers/authenticated.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import type { MutationAccountPasswordChangeArgs, MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ログイン済のみ
    """
    accountPasswordChange(
      """
      ${User.Password.MIN_GRAPHEMES}文字以上、${User.Password.MAX_GRAPHEMES}文字まで
      """
      oldPassword: String!

      """
      ${User.Password.MIN_GRAPHEMES}文字以上、${User.Password.MAX_GRAPHEMES}文字まで
      """
      newPassword: String!
    ): AccountPasswordChangeResult @semanticNonNull @complexity(value: 1000)
  }

  union AccountPasswordChangeResult =
    | AccountPasswordChangeSuccess
    | InvalidInputErrors
    | NewPasswordSameAsOldError
    | IncorrectOldPasswordError

  type AccountPasswordChangeSuccess {
    user: User!
  }

  type NewPasswordSameAsOldError implements Error {
    message: String!
  }

  type IncorrectOldPasswordError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["accountPasswordChange"] = async (_parent, args, ctx) => {
  assertAuthenticated(ctx);

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await changeAccountPassword(ctx, {
    userId: ctx.user.id,
    ...parsed.value,
  });
  switch (result.type) {
    case "AccountNotFound":
      throw internalServerError();
    case "NewPasswordSameAsOld":
      return {
        __typename: "NewPasswordSameAsOldError",
        message: "The two passwords must be different.",
      };
    case "IncorrectOldPassword":
      return {
        __typename: "IncorrectOldPasswordError",
        message: "The oldPassword is incorrect.",
      };
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "AccountPasswordChangeSuccess",
        user: result.changed,
      };
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationAccountPasswordChangeArgs) {
  return Result.combineWithAllErrors([
    parseUserPassword(args, "oldPassword", {
      optional: false,
      nullable: false,
    }),
    parseUserPassword(args, "newPassword", {
      optional: false,
      nullable: false,
    }),
  ]).map(([oldPassword, newPassword]) => ({
    oldPassword,
    newPassword,
  }));
}

if (import.meta.vitest) {
  const { testParseArgs } = await import("../_parsers/_test/helpers.ts");

  testParseArgs(parseArgs, {
    valids: [
      {
        oldPassword: "password",
        newPassword: "password2",
      },
      {
        oldPassword: "a".repeat(User.Password.MIN_GRAPHEMES),
        newPassword: "b".repeat(User.Password.MIN_GRAPHEMES),
      },
    ],
    invalids: [
      [
        {
          oldPassword: "a".repeat(User.Password.MIN_GRAPHEMES - 1),
          newPassword: "a".repeat(User.Password.MAX_GRAPHEMES),
        },
        ["oldPassword"],
      ],
      [
        {
          oldPassword: "a".repeat(User.Password.MIN_GRAPHEMES),
          newPassword: "a".repeat(User.Password.MAX_GRAPHEMES + 1),
        },
        ["newPassword"],
      ],
      [
        {
          oldPassword: "a".repeat(User.Password.MAX_GRAPHEMES + 1),
          newPassword: "a".repeat(User.Password.MIN_GRAPHEMES - 1),
        },
        ["oldPassword", "newPassword"],
      ],
    ],
  });
}
