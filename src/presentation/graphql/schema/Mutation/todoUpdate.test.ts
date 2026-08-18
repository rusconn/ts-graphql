import { omit } from "es-toolkit";
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
import { ErrorCode, type MutationTodoUpdateArgs } from "../_types.ts";
import { resolver } from "./todoUpdate.ts";

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

async function todoUpdate(
  ctx: ContextForIT, //
  args: MutationTodoUpdateArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoUpdateArgs = {
      id: "bad-id",
    };

    await expect(todoUpdate(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoUpdateArgs = {
      id: dummyId.todo(),
    };

    try {
      await todoUpdate(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });

  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoUpdateArgs = {
      id: nodes.todos.alice1.id,
      title: null,
    };

    const before = await queries.todo.findOrThrow(dtos.todos.alice1.id);

    const result = await todoUpdate(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["title"]);

    const after = await queries.todo.findOrThrow(dtos.todos.alice1.id);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoUpdateArgs = {
      id: nodes.todos.alice1.id,
    };

    const result = await todoUpdate(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("returns not-found when id not exists on graph", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoUpdateArgs = {
      id: dummyId.todo(),
    };

    const result = await todoUpdate(ctx, args);
    expect(result?.__typename).toBe("ResourceNotFoundError");
  });

  it("returns not-found when user does not own todo", async () => {
    const args: MutationTodoUpdateArgs = {
      id: nodes.todos.bob1.id,
      title: "hacked",
    };

    const result1 = await todoUpdate(contexts.alice, args);
    expect(result1?.__typename).toBe("ResourceNotFoundError");

    const result2 = await todoUpdate(contexts.bob, args);
    expect(result2?.__typename).not.toBe("ResourceNotFoundError");
  });

  it("updates todo using args", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoUpdateArgs = {
      id: nodes.todos.alice1.id,
      title: "foo",
      description: "bar",
    };

    const before = await queries.todo.findOrThrow(dtos.todos.alice1.id);

    const result = await todoUpdate(ctx, args);
    assert(result?.__typename === "TodoUpdateSuccess", result?.__typename);
    const updated = result.todo;
    expect(omit(updated, ["title", "description", "updatedAt"])).toStrictEqual(
      omit(before, ["title", "description", "updatedAt"]),
    );
    expect(updated.title).toBe("foo");
    expect(updated.description).toBe("bar");
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.todo.findOrThrow(dtos.todos.alice1.id);
    expect(after).toStrictEqual(updated);
  });

  it("updates only updatedAt when args is empty", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoUpdateArgs = {
      id: nodes.todos.alice1.id,
    };

    const before = await queries.todo.findOrThrow(dtos.todos.alice1.id);

    const result = await todoUpdate(ctx, args);
    assert(result?.__typename === "TodoUpdateSuccess", result?.__typename);
    const updated = result.todo;
    expect(omit(updated, ["updatedAt"])).toStrictEqual(omit(before, ["updatedAt"]));
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.todo.findOrThrow(dtos.todos.alice1.id);
    expect(after).toStrictEqual(updated);
  });
});
