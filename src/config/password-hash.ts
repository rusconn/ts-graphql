import * as env from "../util/envvar.ts";
import { isProd } from "./exec-env.ts";

export const passwordHashMemoryCost = env.getInt("PASSWORD_HASH_MEMORY_COST");
export const passwordHashTimeCost = env.getInt("PASSWORD_HASH_TIME_COST");
export const passwordHashParallelism = env.getInt("PASSWORD_HASH_PARALLELISM");

if (
  isProd &&
  (passwordHashMemoryCost < 19456 || passwordHashTimeCost < 2 || passwordHashParallelism < 1)
) {
  throw new Error("Invalid PASSWORD_HASH_*");
}
