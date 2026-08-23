import { getValkey } from "../src/app/datasources/valkey/client.ts";

beforeEach(async () => {
  const client = await getValkey();
  await client.flushdb();
});
