import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { TodoQuery } from "../../../../infrastructure/queries/_test/todo.ts";
import { TodoRepo } from "../../../../infrastructure/repositories/todo.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { type ContextForIT, contexts, createContext } from "../../yoga/_test/context.ts";
import { ErrorCode, type MutationTodoDeleteArgs } from "../_types.ts";
import * as todos from "../Todo/_test.ts";
import * as users from "../User/_test.ts";
import { resolver } from "./todoDelete.ts";

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
      id: todos.dummyId(),
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
      id: todos.dummyId(),
    };

    const result = await todoDelete(ctx, args);
    expect(result?.__typename).toBe("ResourceNotFoundError");
  });

  it("returns an error when user does not own todo", async () => {
    const args: MutationTodoDeleteArgs = {
      id: todos.nodes.bob1.id,
    };

    const result1 = await todoDelete(contexts.alice, args);
    expect(result1?.__typename).toBe("ResourceNotFoundError");

    const result2 = await todoDelete(contexts.bob, args);
    expect(result2?.__typename).not.toBe("ResourceNotFoundError");
  });

  it("deletes todo", async () => {
    const ctx = contexts.alice;
    const args: MutationTodoDeleteArgs = {
      id: todos.nodes.alice1.id,
    };

    const before = await todoQuery.countTheirs(users.dtos.alice.id);
    expect(before).toBe(1);

    const result = await todoDelete(ctx, args);
    assert(result?.__typename === "TodoDeleteSuccess", result?.__typename);
    expect(result.id).toBe(args.id);

    const after = await todoQuery.countTheirs(users.dtos.alice.id);
    expect(after).toBe(before - 1);
  });
});
