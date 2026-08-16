import * as env from "../util/envvar.ts";

export const capacity = env.getInt("RATE_LIMIT_CAPACITY");
export const refillPerSecond = env.getInt("RATE_LIMIT_REFILL_PER_SECOND");
export const bucketTtlSeconds = env.getInt("RATE_LIMIT_BUCKET_TTL_SECONDS");

export const signupRequestRateLimit = {
  capacity: env.getInt("SIGNUP_REQUEST_RATE_LIMIT_CAPACITY"),
  refillPerSecond: env.getFloat("SIGNUP_REQUEST_RATE_LIMIT_REFILL_PER_SECOND"),
  ttlSeconds: env.getInt("SIGNUP_REQUEST_RATE_LIMIT_BUCKET_TTL_SECONDS"),
};
