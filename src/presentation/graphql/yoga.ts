import { useOpenTelemetry } from "@envelop/opentelemetry";
import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";
import { trace } from "@opentelemetry/api";
import { createSchema, createYoga } from "graphql-yoga";

import type { AppContext } from "../../application/contexts.ts";
import { isProd } from "../../config/exec-env.ts";
import { maxAliases, maxDepth, maxTokens } from "../../config/graphql-security.ts";
import { endpoint } from "../../config/url.ts";
import { renderApolloStudio } from "../../lib/graphql-yoga/render-apollo-studio.ts";
import { resolvers, typeDefs } from "./schema.ts";
import { buildContext, type PluginContext } from "./yoga/contexts.ts";
import { complexity } from "./yoga/plugins/complexity.ts";
import { errorHandling } from "./yoga/plugins/error-handling.ts";
import { rateLimit } from "./yoga/plugins/rate-limit.ts";
import { readinessCheck } from "./yoga/plugins/readiness-check.ts";

const SENSITIVE_VARIABLES = [
  "token",
  "refreshToken",
  "email",
  "password",
  "oldPassword",
  "newPassword",
];

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
        resolvers: false,
        variables: (vars) => {
          if (!isProd) return JSON.stringify(vars ?? {});
          const masked = { ...vars };
          for (const key of SENSITIVE_VARIABLES) {
            if (key in masked) masked[key] = "[REDACTED]";
          }
          return JSON.stringify(masked);
        },
        result: false,
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
