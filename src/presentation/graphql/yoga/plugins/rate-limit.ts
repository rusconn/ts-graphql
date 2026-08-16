import type { ExecutionResult } from "graphql";
import { isAsyncIterable, type Plugin } from "graphql-yoga";

import { bucketTtlSeconds, capacity, refillPerSecond } from "../../../../config/rate-limit.ts";
import { RateLimitBucketRepo } from "../../../../infrastructure/repositories/rate-limit-bucket.ts";
import { clientIp } from "../../../../util/ip.ts";
import { buildCostExtensions } from "../../../../util/rate-limit.ts";
import { rateLimitedError, type CostExtensions } from "../../schema/_errors/global/rate-limited.ts";
import type { Context } from "../contexts.ts";

const repo = new RateLimitBucketRepo();

type ServerContext = {
  rateLimit?: {
    cost: CostExtensions;
    retryAfterSeconds?: number;
  };
};

type UserContext = ServerContext;

export const rateLimit: Plugin<{}, ServerContext, UserContext> = {
  async onExecute({ args, setResultAndStopExecution, extendContext }) {
    const context = args.contextValue as Context;

    if (context.queryComplexity == null) {
      context.logger.error({ message: "queryComplexity not set" }, "plugin-error");
      throw new Error("queryComplexity not set");
    }

    const requestedQueryCost = context.queryComplexity;
    if (requestedQueryCost <= 0) {
      return;
    }

    let subject: string;
    if (context.user != null) {
      subject = `user:${context.user.id}`;
    } else {
      const ip = clientIp(context.request);
      if (ip == null) {
        context.logger.warn({ message: "no client ip address found" }, "rate-limit-warn");
        return;
      }
      // TODO: NATやIPv6の/64グルーピング等を考慮する
      subject = `guest:${ip}`;
    }

    let result;
    try {
      result = await repo.consume({
        subject,
        cost: requestedQueryCost,
        capacity,
        refillPerSecond,
        ttlSeconds: bucketTtlSeconds,
      });
    } catch (e) {
      context.logger.error(e, "token-consuming-error");
      return;
    }

    const cost = buildCostExtensions({
      requestedQueryCost,
      capacity,
      currentlyAvailable: result.remaining,
      refillPerSecond,
    });

    extendContext({
      rateLimit: {
        cost,
        ...(result.retryAfterSeconds > 0 && {
          retryAfterSeconds: result.retryAfterSeconds,
        }),
      },
    });

    if (!result.ok) {
      context.logger.warn(
        {
          rateLimit: {
            subject,
            cost: requestedQueryCost,
            currentlyAvailable: result.remaining,
            retryAfterSeconds: result.retryAfterSeconds,
          },
        },
        "rate-limited",
      );
      setResultAndStopExecution({
        errors: [rateLimitedError(cost)],
        extensions: { cost },
      });
      return;
    }

    return {
      onExecuteDone: ({
        result,
        setResult,
      }: {
        result: ExecutionResult | AsyncIterableIterator<ExecutionResult>;
        setResult: (newResult: ExecutionResult | AsyncIterableIterator<ExecutionResult>) => void;
      }) => {
        if (!isAsyncIterable(result)) {
          setResult({ ...result, extensions: { ...result.extensions, cost } });
        }
      },
    };
  },
  onResponse({ response, serverContext }) {
    const retryAfterSeconds = serverContext?.rateLimit?.retryAfterSeconds;
    if (retryAfterSeconds != null) {
      response.headers.set("Retry-After", String(retryAfterSeconds));
    }
  },
};
