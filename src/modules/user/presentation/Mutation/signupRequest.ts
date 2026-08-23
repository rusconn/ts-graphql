import { assertGuest } from "../../../../app/graphql/authorizers/guest.ts";
import type { MutationSignupRequestArgs } from "../../../../app/graphql/types.generated.ts";
import {
  internalServerError,
  invalidInputErrors,
  buildCostExtensions,
  clientIp,
  rateLimitedError,
} from "../../../shared/mod.ts";
import { requestSignup } from "../../application/usecases/request-signup.ts";
import { signupRequestRateLimit } from "../../config/signup-rate-limit.ts";
import { Entity as User } from "../../domain/entities/user.ts";
import { parseUserEmail } from "../parsers/user/email.ts";
import type { MutationResolvers } from "../types.generated.ts";

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
  const { testParseArgs } = await import("../../../shared/test.ts");

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
