import type { ExecutionResult } from "graphql";
import { isAsyncIterable, type Plugin, withState } from "graphql-yoga";

import { buildCostExtensions, clientIp, rateLimitedError } from "../../../modules/shared/mod.ts";
import { RateLimitBucketRepo } from "../../datasources/valkey/rate-limit-bucket.ts";
import { bucketTtlSeconds, capacity, refillPerSecond } from "../config/rate-limit.ts";
import type { Context } from "../contexts.ts";

const repo = new RateLimitBucketRepo();

type RateLimitState = {
  retryAfterSeconds?: number;
};

export const rateLimit = withState<Plugin, RateLimitState>((getState) => ({
  async onExecute({ args, setResultAndStopExecution }) {
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

    if (result.retryAfterSeconds > 0) {
      getState({ request: context.request }).forRequest.retryAfterSeconds =
        result.retryAfterSeconds;
    }

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
  onResponse({ response, state }) {
    const retryAfterSeconds = state?.forRequest?.retryAfterSeconds;
    if (retryAfterSeconds != null) {
      response.headers.set("Retry-After", String(retryAfterSeconds));
    }
  },
}));
