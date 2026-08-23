import { createServer } from "node:http";
import process from "node:process";

import { sdk } from "../instrumentation.ts";
import {
  connectionsCheckingIntervalMs,
  keepAliveTimeoutMs,
  maxBodyBytes,
  maxConnections,
  requestTimeoutMs,
} from "./config/http-security.ts";
import { endpoint, port } from "./config/url.ts";
import { kysely } from "./datasources/db/client.ts";
import { disconnectValkey } from "./datasources/valkey/client.ts";
import { yoga } from "./graphql/yoga.ts";
import { createBodyLimitHandler } from "./http/request-body-limit.ts";
import { pino } from "./logger.ts";

const server = createServer(
  { connectionsCheckingInterval: connectionsCheckingIntervalMs },
  createBodyLimitHandler({
    maxBodyBytes,
    requestTimeoutMs,
    requestListener: yoga.requestListener,
  }),
);
server.maxConnections = maxConnections;
server.headersTimeout = requestTimeoutMs;
server.requestTimeout = requestTimeoutMs;
server.keepAliveTimeout = keepAliveTimeoutMs;

server.listen(port, () => {
  console.info(`Server is running on ${endpoint}`);
});

let isShuttingDown = false;

const shutdown = (signal: string) => async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Shutdown started by ${signal}`);
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await yoga.dispose();
  await kysely.destroy();
  await disconnectValkey();
  pino.flush();
  await sdk.shutdown();
  console.log("Shutdown completed");
};

// プラットフォームに合わせたシグナルハンドリングが必要
process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));
