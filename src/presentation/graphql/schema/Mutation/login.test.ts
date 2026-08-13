import type { ControlledTransaction } from "kysely";

import * as Domain from "../../../../domain/entities.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import type { NewRefreshToken } from "../../../../infrastructure/datasources/db/types.ts";
import { toDomain } from "../../../../infrastructure/repositories/refresh-token.ts";
import { addDates } from "../../../../lib/date-immutable.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import type { Context } from "../../yoga/context.ts";
import { db, domain } from "../_test/data.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { createContext } from "../_test/helpers.ts";
import type { MutationLoginArgs } from "../_types.ts";
import { resolver } from "./login.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;
let queries: Queries;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  queries = createQueries(trx);
  seeders = createSeeders(trx);
  await seeders.users(domain.users.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function login(
  ctx: ContextForIT, //
  args: MutationLoginArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: `${"a".repeat(Domain.User.Email.MAX - 12 + 1)}@example.com`,
      password: "password",
    };

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]).toBeUndefined();
    expect(before[1].length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: "email@example.com",
      password: "password",
    };

    const result = await login(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("returns an error when email does not exists on server", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: "not-exists@example.com",
      password: "password",
    };

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]).toBeUndefined();
    expect(before[1].length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginFailedError", result?.__typename);
    expect(result.message).toBe("Incorrect email or password."); // should mask detail

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("returns an error when args is incorrect", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: ctx.user.email,
      password: "incorrect",
    };

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]).toBeUndefined();
    expect(before[1].length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginFailedError", result?.__typename);
    expect(result.message).toBe("Incorrect email or password."); // should mask detail

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("logins and supplies a refresh token", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: ctx.user.email,
      password: "alicealice",
    };

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]).toBeUndefined();
    expect(before[1].length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginSuccess", result?.__typename);
    const _token = result.token; // 使えることはE2Eで検証する

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after[0]).not.toBeUndefined();
    expect(after[1].length).toBe(1);
  });

  it("retains latest 5 refresh tokens", async () => {
    const SEED_TOKENS = [
      "4b4cca1bc884fd87087da6c96d1bf460f6a6952bae8bcad96043ab662a7ee24b",
      "f946d9d2f885d1088a5410eb4bf47e224660321e1ad8f15e76ee2cdbeeb01c1c",
      "b22aa3c2b13dea5cd49e973eda75381ea24636b649373fb6e1a9582fcff7595f",
      "547e4fe9aacd9033f9a989b7062c97f409f2a8c18af26bd36659bf9315ec99a9",
      "d44fb52221ba3b82138bba16cf67380b1e688af5117685c7e1997a02f4d87cc9",
    ];

    // seed
    const dbRefreshTokens = Array.from({ length: 5 }).map((_, i) => {
      const createdAt = new Date(`2026-01-01T00:00:00.00${i}Z`);
      const expiresAt = addDates(createdAt, 7);
      return {
        token: SEED_TOKENS[i]!,
        userId: db.users.alice.id,
        expiresAt,
        createdAt,
      } satisfies NewRefreshToken;
    });
    const refreshTokens = dbRefreshTokens.map(toDomain);
    await seeders.refreshTokens(...refreshTokens);

    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: ctx.user.email,
      password: "alicealice",
    };

    const before = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(before.length).toBe(5);
    expect(before.map((a) => a.createdAt.toISOString()).sort()[0]).toEqual(
      `2026-01-01T00:00:00.00${0}Z`,
    );

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginSuccess", result?.__typename);
    const _token = result.token; // 使えることはE2Eで検証する

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after.length).toBe(5);
    expect(after.map((a) => a.createdAt.toISOString()).sort()[0]).toEqual(
      `2026-01-01T00:00:00.00${1}Z`,
    );
  });
});
