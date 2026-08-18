import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { entities, dtos } from "../_test/data.ts";
import { type ContextForIT, contexts } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode, type ResolversParentTypes } from "../_types.ts";
import { resolver } from "./user.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(entities.users.alice);
  await seeders.users(entities.users.bob);
  await seeders.todos(entities.todos.alice1);
  await seeders.todos(entities.todos.bob1);
});

afterAll(async () => {
  await trx.rollback().execute();
});

async function user(
  ctx: ContextForIT, //
  parent: ResolversParentTypes["Todo"],
) {
  return await resolver(parent, {}, createContext(ctx, trx));
}

describe("logic", () => {
  it("throws forbidden when client is not owner", async () => {
    const ctx = contexts.bob;
    const parent: ResolversParentTypes["Todo"] = dtos.todos.alice1;

    await expect(user(ctx, parent)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("returns user when client is owner", async () => {
    const ctx = contexts.alice;
    const parent: ResolversParentTypes["Todo"] = dtos.todos.alice1;

    const result = await user(ctx, parent);
    expect(result?.id).toBe(dtos.users.alice.id);
  });
});
