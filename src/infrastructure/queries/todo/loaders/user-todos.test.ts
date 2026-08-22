import type { ControlledTransaction } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import * as todos from "../../../../domain/entities/_test/todos.ts";
import * as users from "../../../../domain/entities/_test/users.ts";
import { kysely } from "../../../datasources/db/client.ts";
import type { DB, Todo } from "../../../datasources/db/types.ts";
import { TodoRepo } from "../../../repositories/todo.ts";
import { UserRepo } from "../../../repositories/user.ts";
import * as UserTodosLoader from "./user-todos.ts";

let trx: ControlledTransaction<DB>;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  const todoRepo = new TodoRepo(trx);
  const userRepo = new UserRepo(trx);
  await users.seed(userRepo, users.entities.alice, users.entities.bob);
  await todos.seed(
    todoRepo,
    todos.entities.alice1,
    todos.entities.alice2,
    todos.entities.alice3,
    todos.entities.bob1,
  );
});

afterAll(async () => {
  await trx.rollback().execute();
});

const ids = (todos: Todo[]) => todos.map((todo) => todo.id);

describe("batchGet", () => {
  it("returns correct results for keys with different sortKey/limit in the same batch", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: users.entities.alice.id,
        sortKey: "createdAt",
        reverse: false,
        limit: 2,
      }),
      loader.load({
        userId: users.entities.alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 2,
      }),
    ]);

    expect(ids(result1)).toStrictEqual([todos.entities.alice1.id, todos.entities.alice2.id]);
    expect(ids(result2)).toStrictEqual([todos.entities.alice1.id, todos.entities.alice3.id]);
  });

  it("returns correct results for keys with different reverse in the same batch", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: users.entities.alice.id,
        sortKey: "createdAt",
        reverse: false,
        limit: 50,
      }),
      loader.load({
        userId: users.entities.alice.id,
        sortKey: "createdAt",
        reverse: true,
        limit: 50,
      }),
    ]);

    expect(ids(result1)).toStrictEqual([
      todos.entities.alice1.id,
      todos.entities.alice2.id,
      todos.entities.alice3.id,
    ]);
    expect(ids(result2)).toStrictEqual([
      todos.entities.alice3.id,
      todos.entities.alice2.id,
      todos.entities.alice1.id,
    ]);
  });

  it("returns correct results for keys with different status in the same batch", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: users.entities.alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 50,
        status: "pending",
      }),
      loader.load({
        userId: users.entities.alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 50,
        status: "done",
      }),
    ]);

    expect(ids(result1)).toStrictEqual([todos.entities.alice1.id, todos.entities.alice3.id]);
    expect(ids(result2)).toStrictEqual([todos.entities.alice2.id]);
  });

  it("returns correct results for keys with different cursor in the same batch", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: users.entities.alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 2,
      }),
      loader.load({
        userId: users.entities.alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 2,
        cursor: todos.entities.alice3.id,
      }),
    ]);

    expect(ids(result1)).toStrictEqual([todos.entities.alice1.id, todos.entities.alice3.id]);
    expect(ids(result2)).toStrictEqual([todos.entities.alice2.id]);
  });

  it("returns correct results for keys of multiple users in the same batch", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: users.entities.alice.id,
        sortKey: "createdAt",
        reverse: false,
        limit: 50,
      }),
      loader.load({
        userId: users.entities.bob.id,
        sortKey: "createdAt",
        reverse: false,
        limit: 50,
      }),
    ]);

    expect(ids(result1)).toStrictEqual([
      todos.entities.alice1.id,
      todos.entities.alice2.id,
      todos.entities.alice3.id,
    ]);
    expect(ids(result2)).toStrictEqual([todos.entities.bob1.id]);
  });
});
