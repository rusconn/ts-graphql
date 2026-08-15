import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";
import { createSchema, createYoga } from "graphql-yoga";

import type { AppContext } from "../../application/contexts.ts";
import { maxAliases, maxDepth, maxTokens } from "../../config/graphql-security.ts";
import { endpoint } from "../../config/url.ts";
import { requestId } from "../../lib/graphql-yoga/plugins/request-id.ts";
import { renderApolloStudio } from "../../lib/graphql-yoga/render-apollo-studio.ts";
import { resolvers, typeDefs } from "./schema.ts";
import { buildContext, type PluginContext } from "./yoga/contexts.ts";
import { complexity } from "./yoga/plugins/complexity.ts";
import { errorHandling } from "./yoga/plugins/error-handling.ts";
import { logging } from "./yoga/plugins/logging.ts";
import { rateLimit } from "./yoga/plugins/rate-limit.ts";
import { readinessCheck } from "./yoga/plugins/readiness-check.ts";

export const yoga = createYoga<PluginContext, AppContext>({
  cors: { origin: "*", credentials: false },
  renderGraphiQL: () => renderApolloStudio(endpoint),
  schema: createSchema({ typeDefs, resolvers }),
  context: buildContext,
  logging: false,
  plugins: [
    readinessCheck,
    requestId,
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
    logging,
    errorHandling,
  ],
});
