import type { Logger } from "pino";
import type { EmptyObject } from "type-fest";

import { registrationFormUrl } from "../../../config/signup-email-verification.ts";
import { User } from "../../../domain/entities.ts";
import type { IUserRepoForGuest } from "../../../domain/repositories/user/for-guest.ts";
import type { DiscriminatedUnion } from "../../../lib/type.ts";
import type { Mailer } from "../../mailers/mailer.ts";
import type { ISignupRequestRateLimiter } from "../../rate-limiters/signup-request.ts";
import * as EmailVerification from "./_email-verification.ts";

type RequestSignupContext = {
  repos: { user: IUserRepoForGuest };
  logger: Logger;
  mailer: Mailer;
  signupRequestRateLimiter: ISignupRequestRateLimiter;
};

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
  ctx: RequestSignupContext,
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
