import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../app/datasources/db/client.ts";
import {
  contexts,
  createContext,
  type ContextForIT,
} from "../../../../app/graphql/test/context.ts";
import type { MutationTodoCreateArgs } from "../../../../app/graphql/types.generated.ts";
import { Uuidv7, type DB } from "../../../shared/mod.ts";
import { UserRepo, users } from "../../../user/test.ts";
import { createTodo } from "../../application/usecases/create-todo.ts";
import { Entity } from "../../domain/entities/todo.ts";
import { TodoQuery } from "../../infrastructure/queries/test/todo.ts";
import { TodoRepo } from "../../infrastructure/repositories/todo.ts";
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

async function todoCreate(ctx: ContextForIT, args: MutationTodoCreateArgs) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoCreateArgs = {
      title: "a".repeat(Entity.Title.MAX_GRAPHEMES + 1),
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

  it("returns UserNotFound when user does not exist", async () => {
    const result = await createTodo(
      { repos: { todo: new TodoRepo(trx) } },
      {
        userId: Uuidv7.gen() as Entity["userId"],
        title: "foo" as Entity["title"],
        description: "bar" as Entity["description"],
      },
    );
    expect(result.type).toBe("UserNotFound");
  });
});
