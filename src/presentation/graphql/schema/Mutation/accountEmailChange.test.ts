import { omit } from "es-toolkit";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import { entities, dtos, contexts, type ContextForIT } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import type { MutationAccountEmailChangeArgs } from "../_types.ts";
import { resolver } from "./accountEmailChange.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;
let queries: Queries;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  queries = createQueries(trx);
  seeders = createSeeders(trx);
  await seeders.users(entities.users.alice, entities.users.bob);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function accountEmailChange(
  ctx: ContextForIT, //
  args: MutationAccountEmailChangeArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountEmailChangeArgs = {
      email: "emailexample.com",
    };

    const before = await queries.user.findOrThrow(ctx.user.id);

    const result = await accountEmailChange(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["email"]);

    const after = await queries.user.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountEmailChangeArgs = {
      email: "email@example.com",
    };

    const result = await accountEmailChange(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("returns an error when email already taken", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountEmailChangeArgs = {
      email: dtos.users.bob.email,
    };

    const result = await accountEmailChange(ctx, args);
    expect(result?.__typename).toBe("EmailAlreadyTakenError");

    // DBの一意制約違反発生時にトランザクションがabortされるのでafterの取得ができない。
  });

  it("changes email using args", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountEmailChangeArgs = {
      email: "email@example.com",
    };

    const before = await queries.user.findOrThrow(ctx.user.id);

    const result = await accountEmailChange(ctx, args);
    assert(result?.__typename === "AccountEmailChangeSuccess", result?.__typename);
    const changed = result.user;
    expect(omit(changed, ["email", "updatedAt"])).toStrictEqual(
      omit(before, ["email", "updatedAt"]),
    );
    expect(changed.email).toBe("email@example.com");
    expect(changed.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.user.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(changed);
  });
});
