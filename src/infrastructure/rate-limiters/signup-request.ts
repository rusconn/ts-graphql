import type {
  ISignupRequestRateLimiter,
  SignupRequestRateLimitResult,
} from "../../application/rate-limiters/signup-request.ts";
import { signupRequestRateLimit } from "../../config/rate-limit.ts";
import { RateLimitBucketRepo } from "../repositories/rate-limit-bucket.ts";

export class SignupRequestRateLimiter implements ISignupRequestRateLimiter {
  #repo;

  constructor() {
    this.#repo = new RateLimitBucketRepo();
  }

  async consume(ip: string): Promise<SignupRequestRateLimitResult> {
    const { capacity, refillPerSecond, ttlSeconds } = signupRequestRateLimit;
    const result = await this.#repo.consume({
      subject: `signup-request:${ip}`,
      cost: 1,
      capacity,
      refillPerSecond,
      ttlSeconds,
    });
    return {
      ok: result.ok,
      remaining: result.remaining,
      retryAfterSeconds: result.retryAfterSeconds,
    };
  }
}
