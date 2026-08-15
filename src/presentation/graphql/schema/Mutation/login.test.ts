import type { ControlledTransaction } from "kysely";

import * as Entities from "../../../../domain/entities.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import type { NewRefreshToken } from "../../../../infrastructure/datasources/db/types.ts";
import { toEntity } from "../../../../infrastructure/repositories/refresh-token.ts";
import { addDates } from "../../../../lib/date-immutable.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import { items, entities, contexts, type ContextForIT } from "../_test/data.ts";
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
  await seeders.users(entities.users.alice);
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
    const ctx = contexts.alice;
    const args: MutationLoginArgs = {
      email: `${"a".repeat(Entities.User.Email.MAX - 12 + 1)}@example.com`,
      password: "password",
    };

    const before = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(before.length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after.length).toBe(before.length);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = contexts.alice;
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
    const ctx = contexts.alice;
    const args: MutationLoginArgs = {
      email: "not-exists@example.com",
      password: "password",
    };

    const before = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(before.length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginFailedError", result?.__typename);
    expect(result.message).toBe("Incorrect email or password."); // should mask detail

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after.length).toBe(before.length);
  });

  it("returns an error when args is incorrect", async () => {
    const ctx = contexts.alice;
    const args: MutationLoginArgs = {
      email: ctx.user.email,
      password: "incorrect",
    };

    const before = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(before.length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginFailedError", result?.__typename);
    expect(result.message).toBe("Incorrect email or password."); // should mask detail

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after.length).toBe(before.length);
  });

  it("logins and supplies a refresh token", async () => {
    const ctx = contexts.alice;
    const args: MutationLoginArgs = {
      email: ctx.user.email,
      password: "alicealice",
    };

    const before = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(before.length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginSuccess", result?.__typename);
    const _accessToken = result.accessToken; // 使えることはE2Eで検証する
    const _refreshToken = result.refreshToken; // 使えることはE2Eで検証する

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after.length).toBe(1);
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
        userId: items.users.alice.id,
        expiresAt,
        createdAt,
      } satisfies NewRefreshToken;
    });
    const refreshTokens = dbRefreshTokens.map(toEntity);
    await seeders.refreshTokens(...refreshTokens);

    const ctx = contexts.alice;
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
    const _accessToken = result.accessToken; // 使えることはE2Eで検証する
    const _refreshToken = result.refreshToken; // 使えることはE2Eで検証する

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after.length).toBe(5);
    expect(after.map((a) => a.createdAt.toISOString()).sort()[0]).toEqual(
      `2026-01-01T00:00:00.00${1}Z`,
    );
  });
});
