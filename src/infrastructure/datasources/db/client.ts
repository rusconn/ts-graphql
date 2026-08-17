import { CamelCasePlugin, Kysely, PostgresDialect, type LogEvent } from "kysely";
import pg, { type DatabaseError } from "pg";
import type { Logger } from "pino";

import { connectionString } from "../../../config/db.ts";
import { isDev, isProd } from "../../../config/exec-env.ts";
import { pino } from "../../loggers/pino.ts";
import type { DB } from "./types.ts";

// PostgreSQL's string of int8(bigint, bigserial) -> js number(possible loss of precision)
pg.types.setTypeParser(pg.types.builtins.INT8, Number);

const pool = new pg.Pool({
  connectionString,
  connectionTimeoutMillis: 2_000,
});
const dialect = new PostgresDialect({ pool });
const plugins = [new CamelCasePlugin()];

export function createKysely(logger: Logger) {
  return new Kysely<DB>({
    dialect,
    plugins,
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
            logger.error(errorLog, "query-error");
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
}

// loggerが無い文脈用
export const kysely = createKysely(pino);

function baseLog(event: LogEvent) {
  return {
    sql: event.query.sql,
    params: isProd ? "***" : event.query.parameters,
    duration: `${Math.round(event.queryDurationMillis)}ms`,
  };
}
