import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";

import { connectionString } from "../../../config/db.ts";
import type { DB } from "./types.ts";

// PostgreSQL's string of int8(bigint, bigserial) -> js number(possible loss of precision)
pg.types.setTypeParser(pg.types.builtins.INT8, Number);

export const kysely = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
      connectionTimeoutMillis: 2_000,
    }),
  }),
  plugins: [new CamelCasePlugin()],
});
