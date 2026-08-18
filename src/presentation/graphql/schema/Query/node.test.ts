import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { entities, dtos, nodes } from "../_test/data.ts";
import { type ContextForIT, contexts } from "../_test/data.ts";
import { createContext, dummyId } from "../_test/helpers.ts";
import { ErrorCode, type QueryNodeArgs } from "../_types.ts";
import { resolver } from "./node.ts";

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

async function node(
  ctx: ContextForIT, //
  args: QueryNodeArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = contexts.alice;
    const args: QueryNodeArgs = {
      id: "bad-id",
    };

    await expect(node(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = contexts.alice;
    const args: QueryNodeArgs = {
      id: dummyId.todo(),
    };

    try {
      await node(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("logic", () => {
  it("returns null when id not exists on graph", async () => {
    const ctx = contexts.alice;
    const args: QueryNodeArgs = {
      id: dummyId.todo(),
    };

    const result = await node(ctx, args);
    expect(result).toBeNull();
  });

  it("returns null when client does not own node", async () => {
    const args: QueryNodeArgs = {
      id: nodes.todos.bob1.id,
    };

    const result1 = await node(contexts.alice, args);
    expect(result1).toBeNull();

    const result2 = await node(contexts.bob, args);
    expect(result2).not.toBeNull();
  });

  it("returns node when client owns the node", async () => {
    const ctx = contexts.alice;
    const args: QueryNodeArgs = {
      id: nodes.todos.alice1.id,
    };

    const result = await node(ctx, args);
    assert(result);
    expect(result.id).toBe(dtos.todos.alice1.id);
  });
});
