import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { entities, dtos, nodes } from "../_test/data.ts";
import { type ContextForIT, contexts } from "../_test/data/contexts/dynamic.ts";
import { createContext, dummyId } from "../_test/helpers.ts";
import { ErrorCode, type ResolversParentTypes, type UserTodoArgs } from "../_types.ts";
import { resolver } from "./todo.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(entities.users.alice, entities.users.admin);
  await seeders.todos(entities.todos.alice1, entities.todos.admin1);
});

afterAll(async () => {
  await trx.rollback().execute();
});

async function todo(
  ctx: ContextForIT, //
  parent: ResolversParentTypes["User"],
  args: UserTodoArgs,
) {
  return await resolver(parent, args, createContext(ctx, trx));
}

describe("parsing", () => {
  const ctx = contexts.alice();
  const parent: ResolversParentTypes["User"] = dtos.users.alice;

  it("throws an input error when id is invalid", async () => {
    const args: UserTodoArgs = {
      id: "bad-id",
    };

    await expect(todo(ctx, parent, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const args: UserTodoArgs = {
      id: dummyId.todo(),
    };

    try {
      await todo(ctx, parent, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("logic", () => {
  it("returns null when id is not exists on server", async () => {
    const ctx = contexts.alice();
    const parent: ResolversParentTypes["User"] = dtos.users.alice;
    const args: UserTodoArgs = {
      id: dummyId.todo(),
    };

    const result = await todo(ctx, parent, args);
    expect(result).toBeNull();
  });

  it("returns todo when user is owner", async () => {
    const ctx = contexts.alice();
    const parent: ResolversParentTypes["User"] = dtos.users.alice;
    const args: UserTodoArgs = {
      id: nodes.todos.alice1.id,
    };

    const result = await todo(ctx, parent, args);
    expect(result?.id).toBe(entities.todos.alice1.id);
  });
});
