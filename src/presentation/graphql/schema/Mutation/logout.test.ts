import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import { clients, entities, dtos, contexts, type ContextForIT } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import type { MutationLogoutArgs } from "../_types.ts";
import { resolver } from "./logout.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;
let queries: Queries;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  queries = createQueries(trx);
  seeders = createSeeders(trx);
  await seeders.users(entities.users.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function logout(
  ctx: ContextForIT, //
  args: MutationLogoutArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("usecase", () => {
  it("returns void when refresh token is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationLogoutArgs = {
      refreshToken: "bad-refresh-token",
    };

    const before = await queries.refreshToken.countTheirs(dtos.users.alice.id);
    expect(before).toBe(0);

    await logout(ctx, args);

    const after = await queries.refreshToken.countTheirs(dtos.users.alice.id);
    expect(after).toBe(before);
  });

  it("returns void when refresh token not exists on server", async () => {
    await seeders.refreshTokens(entities.refreshTokens.alice);

    const ctx = contexts.alice;
    const args: MutationLogoutArgs = {
      refreshToken: "4b4cca1bc884fd87087da6c96d1bf460f6a6952bae8bcad96043ab662a7ee24b",
    };

    const before = await queries.refreshToken.countTheirs(dtos.users.alice.id);
    expect(before).toBe(1);

    await logout(ctx, args);

    const after = await queries.refreshToken.countTheirs(dtos.users.alice.id);
    expect(after).toBe(before);
  });

  it("logouts and removes the refresh token when it is valid", async () => {
    await seeders.refreshTokens(entities.refreshTokens.alice);

    const ctx = contexts.alice;
    const args: MutationLogoutArgs = {
      refreshToken: clients.refreshTokens.alice,
    };

    const before = await queries.refreshToken.countTheirs(dtos.users.alice.id);
    expect(before).toBe(1);

    await logout(ctx, args);

    const after = await queries.refreshToken.countTheirs(dtos.users.alice.id);
    expect(after).toBe(before - 1);
  });
});
