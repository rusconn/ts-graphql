import type { ControlledTransaction } from "kysely";

import * as Entities from "../../../../domain/entities.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { TodoQuery } from "../../../../infrastructure/queries/_test/todo.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { contexts, createContext, type ContextForIT } from "../../yoga/_test/context.ts";
import type { MutationTodoCreateArgs } from "../_types.ts";
import * as users from "../User/_test.ts";
import { resolver } from "./todoCreate.ts";

let trx: ControlledTransaction<DB>;
let todoQuery: TodoQuery;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  todoQuery = new TodoQuery(trx);
  const userRepo = new UserRepo(trx);
  await users.seed(userRepo, users.entities.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function todoCreate(
  ctx: ContextForIT, //
  args: MutationTodoCreateArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoCreateArgs = {
      title: "a".repeat(Entities.Todo.Title.MAX_GRAPHEMES + 1),
      description: "bar",
    };

    const before = await todoQuery.countTheirs(ctx.user.id);

    const result = await todoCreate(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["title"]);

    const after = await todoQuery.countTheirs(ctx.user.id);
    expect(after).toBe(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoCreateArgs = {
      title: "foo",
      description: "bar",
    };

    const result = await todoCreate(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("creates a todo using args", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoCreateArgs = {
      title: "foo",
      description: "bar",
    };

    const before = await todoQuery.countTheirs(ctx.user.id);

    const result = await todoCreate(ctx, args);
    assert(result?.__typename === "TodoCreateSuccess", result?.__typename);
    const created = result.todo;
    expect(created.title).toBe("foo");
    expect(created.description).toBe("bar");

    const after = await todoQuery.countTheirs(ctx.user.id);
    expect(after).toBe(before + 1);

    const stored = await todoQuery.findOrThrow(created.id);
    expect(stored).toStrictEqual(created);
  });
});
