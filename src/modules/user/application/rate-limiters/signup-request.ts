export type SignupRequestRateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export interface ISignupRequestRateLimiter {
  consume(ip: string): Promise<SignupRequestRateLimitResult>;
}
