import { omit } from "es-toolkit";
import type { ControlledTransaction } from "kysely";

import * as Entities from "../../../../domain/entities.ts";
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
import type { MutationAccountPasswordChangeArgs } from "../_types.ts";
import { resolver } from "./accountPasswordChange.ts";

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

async function accountPasswordChange(
  ctx: ContextForIT, //
  args: MutationAccountPasswordChangeArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountPasswordChangeArgs = {
      oldPassword: "a".repeat(Entities.User.Password.MIN - 1),
      newPassword: "password2",
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(dtos.users.alice.id),
      queries.user.findOrThrow(dtos.users.alice.id),
    ]);

    const result = await accountPasswordChange(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["oldPassword"]);

    const after = await Promise.all([
      queries.credential.findOrThrow(dtos.users.alice.id),
      queries.user.findOrThrow(dtos.users.alice.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountPasswordChangeArgs = {
      oldPassword: "password",
      newPassword: "password2",
    };

    const result = await accountPasswordChange(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("returns an error when passwords are the same", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountPasswordChangeArgs = {
      oldPassword: "password",
      newPassword: "password",
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(dtos.users.alice.id),
      queries.user.findOrThrow(dtos.users.alice.id),
    ]);

    const result = await accountPasswordChange(ctx, args);
    expect(result?.__typename).toBe("NewPasswordSameAsOldError");

    const after = await Promise.all([
      queries.credential.findOrThrow(dtos.users.alice.id),
      queries.user.findOrThrow(dtos.users.alice.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("returns an error when oldPassword is incorrect", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountPasswordChangeArgs = {
      oldPassword: "incorrect",
      newPassword: "password",
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(dtos.users.alice.id),
      queries.user.findOrThrow(dtos.users.alice.id),
    ]);

    const result = await accountPasswordChange(ctx, args);
    expect(result?.__typename).toBe("IncorrectOldPasswordError");

    const after = await Promise.all([
      queries.credential.findOrThrow(dtos.users.alice.id),
      queries.user.findOrThrow(dtos.users.alice.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("changes password using args", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountPasswordChangeArgs = {
      oldPassword: "alicealice",
      newPassword: "alicealice2",
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(dtos.users.alice.id),
      queries.user.findOrThrow(dtos.users.alice.id),
    ]);

    const result = await accountPasswordChange(ctx, args);
    assert(result?.__typename === "AccountPasswordChangeSuccess", result?.__typename);
    const changed = result.user;
    expect(omit(changed, ["updatedAt"])).toStrictEqual(omit(before[1], ["updatedAt"]));
    expect(changed.updatedAt.getTime()).toBeGreaterThan(before[1].updatedAt.getTime());

    const after = await Promise.all([
      queries.credential.findOrThrow(dtos.users.alice.id),
      queries.user.findOrThrow(dtos.users.alice.id),
    ]);
    expect(after[0].password).not.toBe(before[0].password);
    expect(after[1]).toStrictEqual(changed);
  });
});
