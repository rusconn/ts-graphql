import { createServer } from "node:http";
import process from "node:process";

import {
  connectionsCheckingIntervalMs,
  keepAliveTimeoutMs,
  maxBodyBytes,
  maxConnections,
  requestTimeoutMs,
} from "../config/http-security.ts";
import { endpoint, port } from "../config/url.ts";
import { destroyPool } from "../infrastructure/datasources/db/client.ts";
import { disconnectValkey } from "../infrastructure/datasources/valkey/client.ts";
import { pino } from "../infrastructure/loggers/pino.ts";
import { yoga } from "./graphql/yoga.ts";
import { createBodyLimitHandler } from "./http/request-body-limit.ts";

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
  await destroyPool();
  await disconnectValkey();
  pino.flush();
  console.log("Shutdown completed");
};

// プラットフォームに合わせたシグナルハンドリングが必要
process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));
