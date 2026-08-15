import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import * as Entities from "../../../../domain/entities.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { addDates } from "../../../../lib/date-immutable.ts";
import * as RefreshTokenCookie from "../../../_shared/session/refresh-token-cookie.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import type { Context } from "../../yoga/contexts.ts";
import { clients, items, entities } from "../_test/data.ts";
import { type ContextForIT, contexts } from "../_test/data/contexts/dynamic.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode } from "../_types.ts";
import { resolver } from "./tokenRefresh.ts";

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

async function tokenRefresh(
  ctx: ContextForIT, //
) {
  return await resolver({}, {}, createContext(ctx, trx));
}

describe("usecase", () => {
  it("throws an input error when refresh token is not provided", async () => {
    const ctx = contexts.alice();

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context), //
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]).toBeUndefined();

    await expect(tokenRefresh(ctx)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context), //
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("returns an input error when refresh token is invalid", async () => {
    const ctx = contexts.alice();
    await RefreshTokenCookie.set(ctx as Context, {
      value: "invalid-refresh-token" as Entities.RefreshToken.Token.Type,
      expires: items.refreshTokens.alice.expiresAt,
    });

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context), //
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]?.value).not.toBe("");
    expect(before[0]?.expires).not.toBe(0);

    const result = await tokenRefresh(ctx);
    expect(result?.__typename).toBe("InvalidRefreshTokenError");

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context), //
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after[0]?.value).toBe("");
    expect(after[0]?.expires).toBe(0);
    expect(after[1]).toStrictEqual(before[1]);
  });

  it("returns an input error when refresh token not exists on server", async () => {
    const ctx = contexts.alice();
    await RefreshTokenCookie.set(ctx as Context, {
      value: Entities.RefreshToken.Token.create(),
      expires: items.refreshTokens.alice.expiresAt,
    });

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context), //
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]?.value).not.toBe("");
    expect(before[0]?.expires).not.toBe(0);

    const result = await tokenRefresh(ctx);
    expect(result?.__typename).toBe("InvalidRefreshTokenError");

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context), //
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after[0]?.value).toBe("");
    expect(after[0]?.expires).toBe(0);
    expect(after[1]).toStrictEqual(before[1]);
  });

  it("returns an expired error when refresh token is expired", async () => {
    const testToken = await Entities.RefreshToken.create(entities.users.alice.id);
    const { rawRefreshToken, refreshToken } = testToken;
    refreshToken.expiresAt = addDates(new Date(), -3); // expired
    refreshToken.createdAt = addDates(new Date(), -10);
    await seeders.refreshTokens(refreshToken);

    const ctx = contexts.alice();
    await RefreshTokenCookie.set(ctx as Context, {
      value: rawRefreshToken,
      expires: addDates(new Date(), 7), // tampered
    });

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context), //
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]?.value).not.toBe("");
    expect(before[0]?.expires).not.toBe(0);

    const result = await tokenRefresh(ctx);
    expect(result?.__typename).toBe("RefreshTokenExpiredError");

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context), //
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after[0]?.value).toBe("");
    expect(after[0]?.expires).toBe(0);
    expect(after[1]).toStrictEqual(before[1]);
  });

  it("refreshes and supplies a refresh token", async () => {
    const ctx = contexts.alice();
    await RefreshTokenCookie.set(ctx as Context, {
      value: clients.refreshTokens.alice,
      expires: items.refreshTokens.alice.expiresAt,
    });

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context), //
      queries.refreshToken.findTheirs(ctx.user.id),
      queries.refreshToken.countTheirs(ctx.user.id),
    ]);
    expect(before[0]).not.toBeUndefined();
    expect(before[2]).toBe(1);

    const result = await tokenRefresh(ctx);
    assert(result?.__typename === "TokenRefreshSuccess", result?.__typename);
    const _token = result.token; // 使えることはE2Eで検証する

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
      queries.refreshToken.countTheirs(ctx.user.id),
    ]);
    expect(after[0]).not.toStrictEqual(before[0]);
    expect(after[1]).not.toStrictEqual(before[1]);
    expect(after[2]).toBe(before[2]);
  });
});
