import { jwtVerify, SignJWT } from "jose";
import { JOSEError, JWTExpired } from "jose/errors";
import type { Tagged } from "type-fest";

import { signingKey, ttlSeconds } from "../../../config/signup-email-verification.ts";
import type * as User from "../../../domain/entities/user.ts";
import * as UserEmail from "../../../domain/entities/user/email.ts";

export type Token = Tagged<string, "EmailVerificationToken">;

type EmailVerificationClaims = {
  email: User.Type["email"];
};

export async function sign(email: User.Type["email"]): Promise<Token> {
  return (await new SignJWT({ email } satisfies EmailVerificationClaims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1_000) + ttlSeconds)
    .sign(signingKey)) as Token;
}

export async function verify(token: string) {
  try {
    const { payload } = await jwtVerify<EmailVerificationClaims>(token, signingKey, {
      clockTolerance: 10,
    });
    return { type: "Success", email: payload.email } as const;
  } catch (e) {
    if (e instanceof JWTExpired) return { type: "Expired" } as const;
    if (e instanceof JOSEError) return { type: "Invalid" } as const;
    return {
      type: "Unknown",
      error: Error.isError(e) ? e : new Error("Unknown", { cause: e }),
    } as const;
  }
}

if (import.meta.vitest) {
  const email = UserEmail.parse("verify@example.com")._unsafeUnwrap();

  it("verifies a token signed by sign()", async () => {
    const result = await verify(await sign(email));
    assert(result.type === "Success", result.type);
    expect(result.email).toBe(email);
  });

  it("rejects a tampered token", async () => {
    const [header, payload, signature] = (await sign(email)).split(".");
    const result = await verify([header, payload, `${signature}x`].join("."));
    expect(result.type).toBe("Invalid");
  });

  it("rejects an expired token", async () => {
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1_000) - 60)
      .sign(signingKey);
    const result = await verify(token);
    expect(result.type).toBe("Expired");
  });
}
