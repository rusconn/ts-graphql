import { type Plugin, useReadinessCheck } from "graphql-yoga";
import { sql } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { getValkey } from "../../../../infrastructure/datasources/valkey/client.ts";
import { pino } from "../../../../infrastructure/loggers/pino.ts";

export const readinessCheck: Plugin = useReadinessCheck({
  check: async () => {
    type Status = 200 | 503;

    let db: Status = 200;
    try {
      await sql`select 1 from users limit 1`.execute(kysely);
    } catch (err) {
      pino.error(err);
      db = 503;
    }

    let valkey: Status = 200;
    try {
      const client = await getValkey();
      await client.ping();
    } catch (err) {
      pino.warn(err, "valkey is down; rate limiting will be disabled");
      valkey = 503;
    }

    const failCloses = { db };
    const failOpens = { valkey };
    const statuses = { ...failCloses, ...failOpens };

    return new Response(JSON.stringify(statuses), {
      status: Object.values(failCloses).includes(503) ? 503 : 200,
    });
  },
});
