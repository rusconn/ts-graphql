import type { ControlledTransaction } from "kysely";

import * as refreshTokens from "../../../../domain/entities/_test/refresh-tokens.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { RefreshTokenQuery } from "../../../../infrastructure/queries/_test/refresh-token.ts";
import { RefreshTokenRepo } from "../../../../infrastructure/repositories/refresh-token.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { type ContextForIT, contexts, createContext } from "../../yoga/_test/context.ts";
import type { MutationLogoutArgs } from "../_types.ts";
import * as users from "../User/_test.ts";
import { resolver } from "./logout.ts";

let trx: ControlledTransaction<DB>;
let refreshTokenQuery: RefreshTokenQuery;
let refreshTokenRepo: RefreshTokenRepo;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  refreshTokenQuery = new RefreshTokenQuery(trx);
  refreshTokenRepo = new RefreshTokenRepo(trx);
  const userRepo = new UserRepo(trx);
  await users.seed(userRepo, users.entities.alice);
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

    const before = await refreshTokenQuery.countTheirs(users.dtos.alice.id);
    expect(before).toBe(0);

    await logout(ctx, args);

    const after = await refreshTokenQuery.countTheirs(users.dtos.alice.id);
    expect(after).toBe(before);
  });

  it("returns void when refresh token not exists on server", async () => {
    await refreshTokens.seed(refreshTokenRepo, refreshTokens.entities.alice);

    const ctx = contexts.alice;
    const args: MutationLogoutArgs = {
      refreshToken: "4b4cca1bc884fd87087da6c96d1bf460f6a6952bae8bcad96043ab662a7ee24b",
    };

    const before = await refreshTokenQuery.countTheirs(users.dtos.alice.id);
    expect(before).toBe(1);

    await logout(ctx, args);

    const after = await refreshTokenQuery.countTheirs(users.dtos.alice.id);
    expect(after).toBe(before);
  });

  it("logouts and removes the refresh token when it is valid", async () => {
    await refreshTokens.seed(refreshTokenRepo, refreshTokens.entities.alice);

    const ctx = contexts.alice;
    const args: MutationLogoutArgs = {
      refreshToken: refreshTokens.raws.alice,
    };

    const before = await refreshTokenQuery.countTheirs(users.dtos.alice.id);
    expect(before).toBe(1);

    await logout(ctx, args);

    const after = await refreshTokenQuery.countTheirs(users.dtos.alice.id);
    expect(after).toBe(before - 1);
  });
});
