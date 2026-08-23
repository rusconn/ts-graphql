import { env } from "../../shared/mod.ts";

export const signupRequestRateLimit = {
  capacity: env.getInt("SIGNUP_REQUEST_RATE_LIMIT_CAPACITY"),
  refillPerSecond: env.getFloat("SIGNUP_REQUEST_RATE_LIMIT_REFILL_PER_SECOND"),
  ttlSeconds: env.getInt("SIGNUP_REQUEST_RATE_LIMIT_BUCKET_TTL_SECONDS"),
};
