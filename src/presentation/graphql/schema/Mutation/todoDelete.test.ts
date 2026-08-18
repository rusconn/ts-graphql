import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import { entities, dtos, nodes, contexts, type ContextForIT } from "../_test/data.ts";
import { createContext, dummyId } from "../_test/helpers.ts";
import { ErrorCode, type MutationTodoDeleteArgs } from "../_types.ts";
import { resolver } from "./todoDelete.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;
let queries: Queries;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  queries = createQueries(trx);
  seeders = createSeeders(trx);
  await seeders.users(entities.users.alice);
  await seeders.users(entities.users.bob);
  await seeders.todos(entities.todos.alice1);
  await seeders.todos(entities.todos.bob1);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function todoDelete(
  ctx: ContextForIT, //
  args: MutationTodoDeleteArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoDeleteArgs = {
      id: "bad-id",
    };

    await expect(todoDelete(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoDeleteArgs = {
      id: dummyId.todo(),
    };

    try {
      await todoDelete(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("usecase", () => {
  it("returns an error when id not exists on graph", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoDeleteArgs = {
      id: dummyId.todo(),
    };

    const result = await todoDelete(ctx, args);
    expect(result?.__typename).toBe("ResourceNotFoundError");
  });

  it("returns an error when user does not own todo", async () => {
    const args: MutationTodoDeleteArgs = {
      id: nodes.todos.bob1.id,
    };

    const result1 = await todoDelete(contexts.alice, args);
    expect(result1?.__typename).toBe("ResourceNotFoundError");

    const result2 = await todoDelete(contexts.bob, args);
    expect(result2?.__typename).not.toBe("ResourceNotFoundError");
  });

  it("deletes todo", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoDeleteArgs = {
      id: nodes.todos.alice1.id,
    };

    const before = await queries.todo.countTheirs(dtos.users.alice.id);
    expect(before).toBe(1);

    const result = await todoDelete(ctx, args);
    assert(result?.__typename === "TodoDeleteSuccess", result?.__typename);
    expect(result.id).toBe(args.id);

    const after = await queries.todo.countTheirs(dtos.users.alice.id);
    expect(after).toBe(before - 1);
  });
});
