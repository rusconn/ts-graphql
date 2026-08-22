import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { TodoRepo } from "../../../../infrastructure/repositories/todo.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { contexts, createContext, type ContextForIT } from "../../yoga/_test/context.ts";
import { ErrorCode, type ResolversParentTypes } from "../_types.ts";
import * as users from "../User/_test.ts";
import * as todos from "./_test.ts";
import { resolver } from "./user.ts";

let trx: ControlledTransaction<DB>;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  const userRepo = new UserRepo(trx);
  const todoRepo = new TodoRepo(trx);
  await users.seed(userRepo, users.entities.alice, users.entities.bob);
  await todos.seed(todoRepo, todos.entities.alice1, todos.entities.bob1);
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
    const parent: ResolversParentTypes["Todo"] = todos.dtos.alice1;

    await expect(user(ctx, parent)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("returns user when client is owner", async () => {
    const ctx = contexts.alice;
    const parent: ResolversParentTypes["Todo"] = todos.dtos.alice1;

    const result = await user(ctx, parent);
    expect(result?.id).toBe(users.dtos.alice.id);
  });
});
