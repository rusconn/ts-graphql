import { env } from "../../modules/shared/mod.ts";

export const connectionString = env.get("DATABASE_URL");
