import { Result } from "neverthrow";

import { login } from "../../../../application/usecases/login.ts";
import * as User from "../../../../domain/entities/user.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserEmail } from "../_parsers/user/email.ts";
import { parseUserPassword } from "../_parsers/user/password.ts";
import type { MutationLoginArgs, MutationResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    login(
      """
      ${User.Email.MAX_GRAPHEMES}文字まで
      """
      email: String!

      """
      ${User.Password.MIN_GRAPHEMES}文字以上、${User.Password.MAX_GRAPHEMES}文字まで
      """
      password: String!
    ): LoginResult @semanticNonNull @complexity(value: 1000)
  }

  union LoginResult = LoginSuccess | InvalidInputErrors | LoginFailedError

  type LoginSuccess {
    accessToken: String!
    refreshToken: String!
  }

  type LoginFailedError implements Error {
    message: String!
  }
`;

export const resolver: MutationResolvers["login"] = async (_parent, args, ctx) => {
  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors(parsed.error);
  }

  const result = await login(ctx, parsed.value);
  switch (result.type) {
    case "UserNotFound":
    case "IncorrectPassword":
      return {
        __typename: "LoginFailedError",
        message: "Incorrect email or password.",
      };
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "LoginSuccess",
        accessToken: result.accessToken,
        refreshToken: result.rawRefreshToken,
      };
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationLoginArgs) {
  return Result.combineWithAllErrors([
    parseUserEmail(args, "email", {
      optional: false,
      nullable: false,
    }),
    parseUserPassword(args, "password", {
      optional: false,
      nullable: false,
    }),
  ]).map(([email, password]) => ({
    email,
    password,
  }));
}

if (import.meta.vitest) {
  const { testParseArgs } = await import("../_parsers/_test/helpers.ts");

  it("cleanses email", () => {
    const parsed = parseArgs({
      email: " Foo\u200B@EXAMPLE.COM ",
      password: "password",
    });
    expect(parsed.isOk()).toBe(true);
    expect(parsed._unsafeUnwrap()).toEqual({
      email: "foo@example.com",
      password: "password",
    });
  });

  it("rejects email with internal whitespace", () => {
    const parsed = parseArgs({
      email: "a b@example.com",
      password: "password",
    });
    expect(parsed.isErr()).toBe(true);
  });

  const validArgs: MutationLoginArgs = {
    email: "email@example.com",
    password: "password",
  };

  const invalidArgs: MutationLoginArgs = {
    email: `${"a".repeat(User.Email.MAX_GRAPHEMES - 12 + 1)}@example.com`,
    password: "a".repeat(User.Password.MIN_GRAPHEMES - 1),
  };

  testParseArgs(parseArgs, {
    valids: [
      { ...validArgs },
      { ...validArgs, email: `${"a".repeat(User.Email.MAX_GRAPHEMES - 12)}@example.com` },
      { ...validArgs, password: "a".repeat(User.Password.MIN_GRAPHEMES) },
    ],
    invalids: [
      [{ ...validArgs, email: invalidArgs.email }, ["email"]],
      [{ ...validArgs, password: invalidArgs.password }, ["password"]],
      [{ ...validArgs, email: "emailexample.com" }, ["email"]],
      [{ ...validArgs, ...invalidArgs }, ["email", "password"]],
    ],
  });
}
