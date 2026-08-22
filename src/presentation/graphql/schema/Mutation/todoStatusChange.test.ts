import { omit } from "es-toolkit";
import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import * as TodoEntity from "../../../../domain/entities/todo.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { TodoQuery } from "../../../../infrastructure/queries/_test/todo.ts";
import { TodoRepo } from "../../../../infrastructure/repositories/todo.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { type ContextForIT, contexts, createContext } from "../../yoga/_test/context.ts";
import { ErrorCode, type MutationTodoStatusChangeArgs, TodoStatus } from "../_types.ts";
import * as todos from "../Todo/_test.ts";
import * as users from "../User/_test.ts";
import { resolver } from "./todoStatusChange.ts";

let trx: ControlledTransaction<DB>;
let todoQuery: TodoQuery;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  todoQuery = new TodoQuery(trx);
  const userRepo = new UserRepo(trx);
  const todoRepo = new TodoRepo(trx);
  await users.seed(userRepo, users.entities.alice, users.entities.bob);
  await todos.seed(todoRepo, todos.entities.alice1, todos.entities.bob1);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function todoStatusChange(
  ctx: ContextForIT, //
  args: MutationTodoStatusChangeArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoStatusChangeArgs = {
      id: "bad-id",
      status: TodoStatus.Done,
    };

    await expect(todoStatusChange(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoStatusChangeArgs = {
      id: todos.dummyId(),
      status: TodoStatus.Done,
    };

    try {
      await todoStatusChange(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("usecase", () => {
  it("returns not-found when id not exists on graph", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoStatusChangeArgs = {
      id: todos.dummyId(),
      status: TodoStatus.Done,
    };

    const result = await todoStatusChange(ctx, args);
    expect(result?.__typename).toBe("ResourceNotFoundError");
  });

  it("returns not-found when user does not own todo", async () => {
    const args: MutationTodoStatusChangeArgs = {
      id: todos.nodes.bob1.id,
      status: TodoStatus.Done,
    };

    const result1 = await todoStatusChange(contexts.alice, args);
    expect(result1?.__typename).toBe("ResourceNotFoundError");

    const result2 = await todoStatusChange(contexts.bob, args);
    expect(result2?.__typename).not.toBe("ResourceNotFoundError");
  });

  it("changes status using args", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoStatusChangeArgs = {
      id: todos.nodes.alice1.id,
      status: TodoStatus.Done,
    };

    const before = await todoQuery.findOrThrow(todos.dtos.alice1.id);

    const result = await todoStatusChange(ctx, args);
    assert(result?.__typename === "TodoStatusChangeSuccess", result?.__typename);
    const changed = result.todo;
    expect(omit(changed, ["status", "updatedAt"])).toStrictEqual(
      omit(before, ["status", "updatedAt"]),
    );
    expect(changed.status).toBe(TodoEntity.Status.DONE);
    expect(changed.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await todoQuery.findOrThrow(todos.dtos.alice1.id);
    expect(after).toStrictEqual(changed);
  });

  it("changes only updatedAt when statuses are the same", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoStatusChangeArgs = {
      id: todos.nodes.alice1.id,
      status: TodoStatus.Pending,
    };

    const before = await todoQuery.findOrThrow(todos.dtos.alice1.id);

    const result = await todoStatusChange(ctx, args);
    assert(result?.__typename === "TodoStatusChangeSuccess", result?.__typename);
    const changed = result.todo;
    expect(omit(changed, ["updatedAt"])).toStrictEqual(omit(before, ["updatedAt"]));
    expect(changed.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await todoQuery.findOrThrow(todos.dtos.alice1.id);
    expect(after).toStrictEqual(changed);
  });
});
