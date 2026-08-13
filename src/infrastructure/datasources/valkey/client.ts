import { GlideClient } from "@valkey/valkey-glide";

import { host, port, useTLS } from "../../../config/valkey.ts";

let clientPromise: Promise<GlideClient> | undefined;
let retryAt = 0;
const cooldownMs = 5_000;

export function getValkey(): Promise<GlideClient> {
  if (Date.now() < retryAt) {
    return Promise.reject(new Error("valkey unavailable (cooldown)"));
  }
  if (clientPromise == null) {
    clientPromise = GlideClient.createClient({
      addresses: [{ host, port }],
      useTLS,
      requestTimeout: 1000,
      advancedConfiguration: {
        connectionTimeout: 1000,
      },
      clientName: "ts-graphql",
    });
    // 次回呼び出しで再試行できるようキャッシュを破棄し、クールダウンを設定する
    clientPromise.catch(() => {
      clientPromise = undefined;
      retryAt = Date.now() + cooldownMs;
    });
  }
  return clientPromise;
}

export async function disconnectValkey() {
  if (clientPromise == null) {
    return;
  }
  const client = await clientPromise.catch(() => null);
  client?.close();
  clientPromise = undefined;
}
