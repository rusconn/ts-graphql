import type { ControlledTransaction } from "kysely";

import * as Entities from "../../../../domain/entities.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { addDates } from "../../../../lib/date-immutable.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import { clients, contexts, entities, type ContextForIT } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import type { MutationAccessTokenRefreshArgs } from "../_types.ts";
import { resolver } from "./accessTokenRefresh.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;
let queries: Queries;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  queries = createQueries(trx);
  seeders = createSeeders(trx);
  await seeders.users(entities.users.alice);
  await seeders.refreshTokens(entities.refreshTokens.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function accessTokenRefresh(
  ctx: ContextForIT, //
  args: MutationAccessTokenRefreshArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("usecase", () => {
  it("returns an input error when refresh token is invalid", async () => {
    const ctx = contexts.alice;

    const before = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(before.length).toBe(1);

    const result = await accessTokenRefresh(ctx, {
      refreshToken: "invalid-refresh-token",
    });
    expect(result?.__typename).toBe("InvalidRefreshTokenError");

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after).toStrictEqual(before);
  });

  it("returns an input error when refresh token not exists on server", async () => {
    const ctx = contexts.alice;

    const before = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(before.length).toBe(1);

    const result = await accessTokenRefresh(ctx, {
      refreshToken: Entities.RefreshToken.Token.create(),
    });
    expect(result?.__typename).toBe("InvalidRefreshTokenError");

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after).toStrictEqual(before);
  });

  it("returns an expired error when refresh token is expired", async () => {
    const testToken = await Entities.RefreshToken.create(entities.users.alice.id);
    const { rawRefreshToken, refreshToken } = testToken;
    refreshToken.expiresAt = addDates(new Date(), -3); // expired
    refreshToken.createdAt = addDates(new Date(), -10);
    await seeders.refreshTokens(refreshToken);

    const ctx = contexts.alice;

    const before = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(before.length).toBe(2);

    const result = await accessTokenRefresh(ctx, {
      refreshToken: rawRefreshToken,
    });
    expect(result?.__typename).toBe("RefreshTokenExpiredError");

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after).toStrictEqual(before);
  });

  it("refreshes and supplies a refresh token", async () => {
    const ctx = contexts.alice;

    const before = await Promise.all([
      queries.refreshToken.findTheirs(ctx.user.id),
      queries.refreshToken.countTheirs(ctx.user.id),
    ]);
    expect(before[1]).toBe(1);

    const result = await accessTokenRefresh(ctx, {
      refreshToken: clients.refreshTokens.alice,
    });
    assert(result?.__typename === "AccessTokenRefreshSuccess", result?.__typename);
    const _accessToken = result.accessToken; // 使えることはE2Eで検証する
    const _refreshToken = result.refreshToken; // 使えることはE2Eで検証する

    const after = await Promise.all([
      queries.refreshToken.findTheirs(ctx.user.id),
      queries.refreshToken.countTheirs(ctx.user.id),
    ]);
    expect(after[0]).not.toStrictEqual(before[0]);
    expect(after[1]).toBe(before[1]);
  });
});
