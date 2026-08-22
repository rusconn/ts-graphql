import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { TodoRepo } from "../../../../infrastructure/repositories/todo.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { type ContextForIT, contexts, createContext } from "../../yoga/_test/context.ts";
import { ErrorCode, type ResolversParentTypes, type UserTodoArgs } from "../_types.ts";
import * as todos from "../Todo/_test.ts";
import * as users from "./_test.ts";
import { resolver } from "./todo.ts";

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

async function todo(
  ctx: ContextForIT, //
  parent: ResolversParentTypes["User"],
  args: UserTodoArgs,
) {
  return await resolver(parent, args, createContext(ctx, trx));
}

describe("parsing", () => {
  const ctx = contexts.alice;
  const parent: ResolversParentTypes["User"] = users.dtos.alice;

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
      id: todos.dummyId(),
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
    const ctx = contexts.alice;
    const parent: ResolversParentTypes["User"] = users.dtos.alice;
    const args: UserTodoArgs = {
      id: todos.dummyId(),
    };

    const result = await todo(ctx, parent, args);
    expect(result).toBeNull();
  });

  it("throws forbidden when user is not owner", async () => {
    const ctx = contexts.bob;
    const parent: ResolversParentTypes["User"] = users.dtos.alice;
    const args: UserTodoArgs = {
      id: todos.nodes.alice1.id,
    };

    await expect(todo(ctx, parent, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("returns todo when user is owner", async () => {
    const ctx = contexts.alice;
    const parent: ResolversParentTypes["User"] = users.dtos.alice;
    const args: UserTodoArgs = {
      id: todos.nodes.alice1.id,
    };

    const result = await todo(ctx, parent, args);
    expect(result?.id).toBe(todos.entities.alice1.id);
  });
});
