import { env } from "../../../modules/shared/mod.ts";

export const maxDepth = env.getInt("QUERY_MAX_DEPTH");
export const maxTokens = env.getInt("QUERY_MAX_TOKENS");
export const maxAliases = env.getInt("QUERY_MAX_ALIASES");
export const maxDirectives = env.getInt("QUERY_MAX_DIRECTIVES");
export const maxComplexity = env.getInt("QUERY_MAX_COMPLEXITY");
