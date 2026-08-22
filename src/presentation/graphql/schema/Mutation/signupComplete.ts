import { Result } from "neverthrow";

import { completeSignup } from "../../../../application/usecases/signup/complete.ts";
import { User } from "../../../../domain/entities.ts";
import { assertGuest } from "../_authorizers/guest.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserName } from "../_parsers/user/name.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import type { MutationResolvers, MutationSignupCompleteArgs } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    未ログインのみ
    """
    signupComplete(
      """
      メールに記載の登録トークン
      """
      token: String!

      """
      ${User.Name.MIN_GRAPHEMES}文字以上、${User.Name.MAX_GRAPHEMES}文字まで
      """
      name: String!

      """
      ${User.Password.MIN_GRAPHEMES}文字以上、${User.Password.MAX_GRAPHEMES}文字まで
      """
      password: String!
    ): SignupCompleteResult @semanticNonNull @complexity(value: 1000)
  }

  union SignupCompleteResult =
    | SignupCompleteSuccess
    | InvalidInputErrors
    | InvalidVerificationTokenError
    | ExpiredVerificationTokenError
    | EmailAlreadyTakenError

  type SignupCompleteSuccess {
    accessToken: String!
    refreshToken: String!
  }
`;

export const resolver: MutationResolvers["signupComplete"] = async (_parent, args, ctx) => {
  assertGuest(ctx);

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await completeSignup(ctx, parsed.value);
  switch (result.type) {
    case "InvalidVerificationToken":
      return {
        __typename: "InvalidVerificationTokenError",
        message: "The verification token is invalid. Please request a new one.",
      };
    case "ExpiredVerificationToken":
      return {
        __typename: "ExpiredVerificationTokenError",
        message: "The verification token has expired. Please request a new one.",
      };
    case "EmailAlreadyTaken":
      return {
        __typename: "EmailAlreadyTakenError",
        message: "The email already taken.",
      };
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "SignupCompleteSuccess",
        accessToken: result.accessToken,
        refreshToken: result.rawRefreshToken,
      };
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationSignupCompleteArgs) {
  return Result.combineWithAllErrors([
    parseUserName(args, "name", {
      optional: false,
      nullable: false,
    }),
    parseUserPassword(args, "password", {
      optional: false,
      nullable: false,
    }),
  ]).map(([name, password]) => ({
    token: args.token,
    name,
    password,
  }));
}

if (import.meta.vitest) {
  const { testParseArgs } = await import("../_parsers/_test/helpers.ts");

  it("cleanses name", () => {
    const parsed = parseArgs({
      token: "token",
      name: " ＡＢＣ ",
      password: "password",
    });
    expect(parsed.isOk()).toBe(true);
    expect(parsed._unsafeUnwrap()).toEqual({
      token: "token",
      name: "ABC",
      password: "password",
    });
  });

  const validArgs: MutationSignupCompleteArgs = {
    token: "token",
    name: "name",
    password: "password",
  };

  const invalidArgs: MutationSignupCompleteArgs = {
    token: "token",
    name: "a".repeat(User.Name.MAX_GRAPHEMES + 1),
    password: "a".repeat(User.Password.MIN_GRAPHEMES - 1),
  };

  testParseArgs(parseArgs, {
    valids: [
      { ...validArgs },
      { ...validArgs, name: "a".repeat(User.Name.MAX_GRAPHEMES) },
      { ...validArgs, password: "a".repeat(User.Password.MIN_GRAPHEMES) },
    ],
    invalids: [
      [{ ...validArgs, name: invalidArgs.name }, ["name"]],
      [{ ...validArgs, password: invalidArgs.password }, ["password"]],
      [{ ...validArgs, ...invalidArgs }, ["name", "password"]],
    ],
  });
}
