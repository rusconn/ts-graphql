import { jwtVerify, SignJWT } from "jose";
import { JOSEError, JWTExpired } from "jose/errors";

import { signingKey, ttlSeconds } from "../../config/access-token.ts";
import * as User from "../../domain/entities/user.ts";
import { toError } from "../../lib/error.ts";

export type Payload = Pick<User.Type, "id">;

export async function sign({ id }: Payload) {
  return await new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1_000) + ttlSeconds)
    .sign(signingKey);
}

export async function verify(accessToken: string) {
  try {
    const result = await jwtVerify<Payload>(accessToken, signingKey);
    return { type: "Success", ...result } as const;
  } catch (e) {
    if (e instanceof JWTExpired) return { type: "Expired" } as const;
    if (e instanceof JOSEError) return { type: "Invalid" } as const;
    return { type: "Unknown", error: toError(e, "Unknown") } as const;
  }
}

if (import.meta.vitest) {
  const id = User.Id.create();

  it("verifies a token signed by sign()", async () => {
    const result = await verify(await sign({ id }));
    assert(result.type === "Success", result.type);
    expect(result.payload.id).toBe(id);
  });

  it("rejects a tampered token", async () => {
    const [header, payload, signature] = (await sign({ id })).split(".");
    const result = await verify([header, payload, `${signature}x`].join("."));
    expect(result.type).toBe("Invalid");
  });

  it("rejects an expired token", async () => {
    const token = await new SignJWT({ id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1_000) - 60)
      .sign(signingKey);
    const result = await verify(token);
    expect(result.type).toBe("Expired");
  });
}
