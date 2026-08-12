import { toHex } from "../bytes/hex.ts";

const encoder = new TextEncoder();

export async function sha256(input: string) {
  const bytes = await sha256Bytes(input);
  return toHex(bytes);
}

export async function sha256Bytes(input: string) {
  const utf8bytes = encoder.encode(input);
  const bytes = await crypto.subtle.digest("SHA-256", utf8bytes);
  return new Uint8Array(bytes);
}
