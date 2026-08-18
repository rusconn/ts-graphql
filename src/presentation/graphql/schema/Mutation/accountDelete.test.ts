import type { ControlledTransaction } from "kysely";

import { User } from "../../../../domain/entities.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import { entities, dtos, nodes, contexts, type ContextForIT } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import type { MutationAccountDeleteArgs } from "../_types.ts";
import { resolver } from "./accountDelete.ts";

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

async function accountDelete(
  ctx: ContextForIT, //
  args: MutationAccountDeleteArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountDeleteArgs = {
      password: "a".repeat(User.Password.MIN_GRAPHEMES - 1),
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(ctx.user.id),
      queries.user.findOrThrow(ctx.user.id),
    ]);

    const result = await accountDelete(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["password"]);

    const after = await Promise.all([
      queries.credential.findOrThrow(ctx.user.id),
      queries.user.findOrThrow(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountDeleteArgs = {
      password: "alicealice",
    };

    const result = await accountDelete(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("deletes account and its resources", async () => {
    await seeders.todos(entities.todos.alice1, entities.todos.alice2);
    await seeders.refreshTokens(entities.refreshTokens.alice);
    const ctx = contexts.alice;
    const args: MutationAccountDeleteArgs = {
      password: "alicealice",
    };

    const before = await Promise.all([
      queries.todo.countTheirs(dtos.users.alice.id),
      queries.refreshToken.countTheirs(dtos.users.alice.id),
      queries.user.count(),
    ]);
    expect(before[0]).toBe(2);
    expect(before[1]).toBe(1);
    expect(before[2]).toBe(1);

    const result = await accountDelete(ctx, args);
    assert(result?.__typename === "AccountDeleteSuccess", result?.__typename);
    expect(result.id).toBe(nodes.users.alice.id);

    const after = await Promise.all([
      queries.todo.countTheirs(dtos.users.alice.id),
      queries.refreshToken.countTheirs(dtos.users.alice.id),
      queries.user.count(),
    ]);
    expect(after[0]).toBe(0);
    expect(after[1]).toBe(0);
    expect(after[2]).toBe(0);
  });
});
