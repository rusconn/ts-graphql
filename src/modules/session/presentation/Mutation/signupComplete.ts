import { Result } from "neverthrow";

import { assertGuest } from "../../../../app/graphql/authorizers/guest.ts";
import type { MutationSignupCompleteArgs } from "../../../../app/graphql/types.generated.ts";
import { internalServerError, invalidInputErrors } from "../../../shared/mod.ts";
import { UserEntity as User, parseUserName, parseUserPassword } from "../../../user/mod.ts";
import { completeSignup } from "../../application/usecases/complete-signup.ts";
import type { MutationResolvers } from "../types.generated.ts";

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
  const { testParseArgs } = await import("../../../shared/test.ts");

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
