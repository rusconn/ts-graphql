import * as env from "../util/envvar.ts";

export const ttlSeconds = env.getInt("SIGNUP_EMAIL_VERIFICATION_TTL_SECONDS");

const key = env.get("SIGNUP_EMAIL_VERIFICATION_SIGNING_KEY");
export const signingKey = new TextEncoder().encode(key);

export const registrationFormUrl = env.get("SIGNUP_FORM_URL");
