import * as env from "../util/envvar.ts";

export const maxConnections = env.getInt("HTTP_MAX_CONNECTIONS");
export const connectionsCheckingIntervalMs = env.getInt("HTTP_CONNECTIONS_CHECKING_INTERVAL_MS");
export const requestTimeoutMs = env.getInt("HTTP_REQUEST_TIMEOUT_MS");
export const keepAliveTimeoutMs = env.getInt("HTTP_KEEP_ALIVE_TIMEOUT_MS");
export const maxBodyBytes = env.getInt("HTTP_MAX_BODY_BYTES");
