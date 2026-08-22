import { omit } from "es-toolkit";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { UserQuery } from "../../../../infrastructure/queries/_test/user.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { contexts, createContext, type ContextForIT } from "../../yoga/_test/context.ts";
import type { MutationAccountUpdateArgs } from "../_types.ts";
import * as users from "../User/_test.ts";
import { resolver } from "./accountUpdate.ts";

let trx: ControlledTransaction<DB>;
let userQuery: UserQuery;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  userQuery = new UserQuery(trx);
  const userRepo = new UserRepo(trx);
  await users.seed(userRepo, users.entities.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function accountUpdate(
  ctx: ContextForIT, //
  args: MutationAccountUpdateArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountUpdateArgs = { name: null };

    const before = await userQuery.findOrThrow(ctx.user.id);

    const result = await accountUpdate(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["name"]);

    const after = await userQuery.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountUpdateArgs = {};

    const result = await accountUpdate(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("updates account using args", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountUpdateArgs = {
      name: "foo",
    };

    const before = await userQuery.findOrThrow(ctx.user.id);

    const result = await accountUpdate(ctx, args);
    assert(result?.__typename === "AccountUpdateSuccess", result?.__typename);
    const updated = result.user;
    expect(omit(updated, ["name", "updatedAt"])).toStrictEqual(omit(before, ["name", "updatedAt"]));
    expect(updated.name).toBe("foo");
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await userQuery.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(updated);
  });

  it("updates only updatedAt when args is empty", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountUpdateArgs = {};

    const before = await userQuery.findOrThrow(ctx.user.id);

    const result = await accountUpdate(ctx, args);
    assert(result?.__typename === "AccountUpdateSuccess", result?.__typename);
    const updated = result.user;
    expect(omit(updated, ["updatedAt"])).toStrictEqual(omit(before, ["updatedAt"]));
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await userQuery.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(updated);
  });
});
