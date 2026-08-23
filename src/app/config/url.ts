import { env } from "../../modules/shared/mod.ts";

export const port = env.getInt("PORT");
export const endpoint = `${env.get("BASE_URL")}:${port}/graphql`;
