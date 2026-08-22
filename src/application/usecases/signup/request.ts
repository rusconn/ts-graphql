import type { Logger } from "pino";
import type { EmptyObject } from "type-fest";

import { registrationFormUrl } from "../../../config/signup-email-verification.ts";
import * as UserEntity from "../../../domain/entities/user.ts";
import type { IUserRepoForGuest } from "../../../domain/repositories/user/for-guest.ts";
import type { DiscriminatedUnion } from "../../../lib/type.ts";
import type { Mailer } from "../../mailers/mailer.ts";
import type { ISignupRequestRateLimiter } from "../../rate-limiters/signup-request.ts";
import * as EmailVerification from "./_email-verification.ts";

type Deps = {
  repos: { user: IUserRepoForGuest };
  logger: Logger;
  mailer: Mailer;
  signupRequestRateLimiter: ISignupRequestRateLimiter;
};

type Input = {
  email: UserEntity.Email.Type;
  ip: string | null;
};

type Output = DiscriminatedUnion<{
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

export async function requestSignup(deps: Deps, input: Input): Promise<Output> {
  const { email, ip } = input;

  if (ip != null) {
    try {
      const limited = await deps.signupRequestRateLimiter.consume(ip);
      if (!limited.ok) {
        return {
          type: "RateLimited",
          remaining: limited.remaining,
          retryAfterSeconds: limited.retryAfterSeconds,
        };
      }
    } catch (e) {
      deps.logger.warn(e, "signup-rate-limiter-unavailable");
    }
  }

  try {
    const existing = await deps.repos.user.findByEmail(email);
    if (existing != null) {
      return { type: "EmailAlreadyTaken" };
    }

    const url = await createVerificationUrl(email);
    await deps.mailer.sendEmailVerification({
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

async function createVerificationUrl(email: UserEntity.Email.Type) {
  const token = await EmailVerification.sign(email);
  const url = new URL(registrationFormUrl);
  url.searchParams.set("token", token);
  return url.toString();
}
