import type { EmptyObject } from "type-fest";

import { registrationFormUrl } from "../../../config/signup-email-verification.ts";
import { User } from "../../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../../lib/type.ts";
import type { AppContextForGuest } from "../../contexts.ts";
import * as EmailVerification from "./_email-verification.ts";

type RequestSignupInput = {
  email: User.Email.Type;
  ip: string | null;
};

type RequestSignupResult = DiscriminatedUnion<{
  EmailAlreadyTaken: EmptyObject;
  RateLimited: {
    remaining: number;
    retryAfterSeconds: number;
  };
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: EmptyObject;
}>;

export async function requestSignup(
  ctx: AppContextForGuest,
  input: RequestSignupInput,
): Promise<RequestSignupResult> {
  const { email, ip } = input;

  if (ip != null) {
    try {
      const limited = await ctx.signupRequestRateLimiter.consume(ip);
      if (!limited.ok) {
        return {
          type: "RateLimited",
          remaining: limited.remaining,
          retryAfterSeconds: limited.retryAfterSeconds,
        };
      }
    } catch (e) {
      ctx.logger.warn(e, "signup-rate-limiter-unavailable");
    }
  }

  try {
    const existing = await ctx.repos.user.findByEmail(email);
    if (existing != null) {
      return { type: "EmailAlreadyTaken" };
    }

    const url = await createVerificationUrl(email);
    await ctx.mailer.sendEmailVerification({
      to: email,
      url,
      subject: "Account registration",
      text: `Please complete your registration by opening the following link.\n\n${url}`,
    });
    return { type: "Success" };
  } catch (e) {
    return { type: "UnexpectedFailure", cause: e };
  }
}

async function createVerificationUrl(email: User.Email.Type) {
  const token = await EmailVerification.sign(email);
  const url = new URL(registrationFormUrl);
  url.searchParams.set("token", token);
  return url.toString();
}
