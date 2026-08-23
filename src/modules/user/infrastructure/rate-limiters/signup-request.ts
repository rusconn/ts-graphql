import type {
  ISignupRequestRateLimiter,
  SignupRequestRateLimitResult,
} from "../../application/rate-limiters/signup-request.ts";
import { signupRequestRateLimit } from "../../config/signup-rate-limit.ts";

export class SignupRequestRateLimiter implements ISignupRequestRateLimiter {
  #repo;

  constructor(repo: {
    consume(input: {
      subject: string;
      cost: number;
      capacity: number;
      refillPerSecond: number;
      ttlSeconds: number;
    }): Promise<SignupRequestRateLimitResult>;
  }) {
    this.#repo = repo;
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
