import { requestSignup } from "../../../../application/usecases/signup/request.ts";
import { signupRequestRateLimit } from "../../../../config/rate-limit.ts";
import { User } from "../../../../domain/entities.ts";
import { clientIp } from "../../../../util/ip.ts";
import { buildCostExtensions } from "../../../../util/rate-limit.ts";
import { assertGuest } from "../_authorizers/guest.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import { rateLimitedError } from "../_errors/global/rate-limited.ts";
import { invalidInputErrors } from "../_errors/user/invalid-input.ts";
import { parseUserEmail } from "../_parsers/user/email.ts";
import type { MutationResolvers, MutationSignupRequestArgs } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    未ログインのみ
    """
    signupRequest(
      """
      ${User.Email.MAX_GRAPHEMES}文字まで、既に登録済みの場合も同一のレスポンスを返す
      """
      email: String!
    ): SignupRequestResult @semanticNonNull @complexity(value: 50)
  }

  union SignupRequestResult =
    | SignupRequestSuccess
    | InvalidInputErrors

  type SignupRequestSuccess {
    message: String!
  }
`;

export const resolver: MutationResolvers["signupRequest"] = async (_parent, args, ctx) => {
  assertGuest(ctx);

  const parsed = parseArgs(args);
  if (parsed.isErr()) {
    return invalidInputErrors([parsed.error]);
  }

  const email = parsed.value;
  const ip = clientIp(ctx.request);

  const result = await requestSignup(ctx, { email, ip });
  switch (result.type) {
    case "RateLimited":
      throw rateLimitedError(
        buildCostExtensions({
          requestedQueryCost: ctx.queryComplexity ?? 1,
          capacity: signupRequestRateLimit.capacity,
          currentlyAvailable: result.remaining,
          refillPerSecond: signupRequestRateLimit.refillPerSecond,
        }),
      );
    case "EmailAlreadyTaken":
    case "Success":
      return {
        __typename: "SignupRequestSuccess",
        message: "A registration email has been sent. Please check your inbox.",
      };
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationSignupRequestArgs) {
  return parseUserEmail(args, "email", {
    optional: false,
    nullable: false,
  });
}

if (import.meta.vitest) {
  const { testParseArgs } = await import("../_parsers/_test/helpers.ts");

  it("cleanses email", () => {
    const parsed = parseArgs({
      email: " Foo\u200B@EXAMPLE.COM ",
    });
    expect(parsed.isOk()).toBe(true);
    expect(parsed._unsafeUnwrap()).toBe("foo@example.com");
  });

  it("rejects email with internal whitespace", () => {
    const parsed = parseArgs({
      email: "a b@example.com",
    });
    expect(parsed.isErr()).toBe(true);
  });

  const validArgs: MutationSignupRequestArgs = {
    email: "email@example.com",
  };

  const invalidArgs: MutationSignupRequestArgs = {
    email: `${"a".repeat(User.Email.MAX_GRAPHEMES - 12 + 1)}@example.com`,
  };

  testParseArgs(parseArgs, {
    valids: [
      { ...validArgs },
      { ...validArgs, email: `${"a".repeat(User.Email.MAX_GRAPHEMES - 12)}@example.com` },
    ],
    invalids: [
      [{ ...validArgs, email: invalidArgs.email }, ["email"]],
      [{ ...validArgs, email: "emailexample.com" }, ["email"]],
    ],
  });
}
