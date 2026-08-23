import { env } from "../../shared/mod.ts";

export const ttlSeconds = env.getInt("ACCESS_TOKEN_TTL_SECONDS");

const key = env.get("ACCESS_TOKEN_SIGNING_KEY");
export const signingKey = new TextEncoder().encode(key);
