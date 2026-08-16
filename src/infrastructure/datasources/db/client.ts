import { CamelCasePlugin, Kysely, PostgresDialect, type LogEvent } from "kysely";
import pg, { type DatabaseError } from "pg";

import { connectionString } from "../../../config/db.ts";
import { isDev, isProd } from "../../../config/exec-env.ts";
import { pino } from "../../loggers/pino.ts";
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
  log(event) {
    switch (event.level) {
      case "query":
        if (isDev) {
          console.log("query-info", baseLog(event));
        }
        break;
      case "error": {
        const e = event.error as DatabaseError;
        const errorLog = {
          message: e.message,
          stack: e.stack,
          table: e.table,
          code: e.code,
          constraint: e.constraint,
          ...baseLog(event),
        };
        if (isProd) {
          pino.error(errorLog, "query-error");
        } else {
          console.error("query-error", errorLog);
        }
        break;
      }
      default:
        throw new Error(event satisfies never);
    }
  },
});

function baseLog(event: LogEvent) {
  return {
    sql: event.query.sql,
    params: isProd ? "***" : event.query.parameters,
    duration: `${Math.round(event.queryDurationMillis)}ms`,
  };
}
