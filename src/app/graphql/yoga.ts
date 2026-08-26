import { useOpenTelemetry } from "@envelop/opentelemetry";
import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";
import { trace } from "@opentelemetry/api";
import { createSchema, createYoga } from "graphql-yoga";

import { renderApolloStudio } from "../../lib/graphql-yoga/render-apollo-studio.ts";
import { isDev } from "../../modules/shared/mod.ts";
import type { AppContext } from "../app-contexts.ts";
import { endpoint } from "../config/url.ts";
import { maxAliases, maxDepth, maxTokens } from "./config/graphql-security.ts";
import { buildContext, type PluginContext } from "./contexts.ts";
import { complexity } from "./plugins/complexity.ts";
import { errorHandling } from "./plugins/error-handling.ts";
import { rateLimit } from "./plugins/rate-limit.ts";
import { readinessCheck } from "./plugins/readiness-check.ts";
import { resolvers } from "./resolvers.ts";
import { typeDefs } from "./type-defs.generated.ts";

export const yoga = createYoga<PluginContext, AppContext>({
  cors: { origin: "*", credentials: false },
  renderGraphiQL: () => renderApolloStudio(endpoint),
  schema: createSchema({ typeDefs, resolvers }),
  context: buildContext,
  logging: false,
  plugins: [
    readinessCheck,
    useOpenTelemetry(
      {
        resolvers: false, // 量が多いので含めない
        document: isDev, // 秘匿情報を埋め込まれる可能性あり、マスクが難しい
        variables: isDev, // 秘匿情報あり、マスクが簡単だが漏れる可能性がある
        result: isDev, // 秘匿情報あり、マスクが難しい
        excludedOperationNames: ["IntrospectionQuery"],
      },
      trace.getTracerProvider(),
    ),
    EnvelopArmorPlugin({
      maxDepth: {
        n: maxDepth,
        flattenFragments: true,
      },
      maxTokens: {
        n: maxTokens,
      },
      maxAliases: {
        n: maxAliases,
      },
      costLimit: {
        enabled: false, // complexity plugin で対応する
      },
    }),
    complexity,
    rateLimit,
    errorHandling,
  ],
});
