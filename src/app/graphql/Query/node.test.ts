import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { ErrorCode, type DB } from "../../../modules/shared/mod.ts";
import { TodoRepo } from "../../../modules/todo/app.ts";
import { todos } from "../../../modules/todo/test.ts";
import { UserRepo } from "../../../modules/user/app.ts";
import { users } from "../../../modules/user/test.ts";
import { kysely } from "../../datasources/db/client.ts";
import { resolvers } from "../resolvers.ts";
import { createContext, type ContextForIT } from "../test/context.ts";
import type { QueryNodeArgs } from "../types.generated.ts";

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

async function node(ctx: ContextForIT, args: QueryNodeArgs) {
  return await resolvers.Query!.node!({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  const ctx = { user: users.dtos.alice };

  it("throws an input error when id is invalid", async () => {
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
    const args: QueryNodeArgs = {
      id: todos.dummyId(),
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
    const ctx = { user: users.dtos.alice };
    const args: QueryNodeArgs = {
      id: todos.dummyId(),
    };

    const result = await node(ctx, args);
    expect(result).toBeNull();
  });

  it("returns null when client does not own node", async () => {
    const args: QueryNodeArgs = {
      id: todos.nodes.bob1.id,
    };

    const result1 = await node({ user: users.dtos.alice }, args);
    expect(result1).toBeNull();

    const result2 = await node({ user: users.dtos.bob }, args);
    expect(result2).not.toBeNull();
  });

  it("returns node when client owns the node", async () => {
    const ctx = { user: users.dtos.alice };
    const args: QueryNodeArgs = {
      id: todos.nodes.alice1.id,
    };

    const result = await node(ctx, args);
    expect(result?.id).toBe(todos.dtos.alice1.id);
  });
});
