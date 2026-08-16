import { getValkey } from "../src/infrastructure/datasources/valkey/client.ts";

beforeEach(async () => {
  const client = await getValkey();
  await client.flushdb();
});
