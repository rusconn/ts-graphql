import type { ControlledTransaction } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import {
  createSeeders,
  type Seeders,
} from "../../../../presentation/_shared/test/helpers/helpers.ts";
import { entities } from "../../../../presentation/graphql/schema/_test/data.ts";
import { kysely } from "../../../datasources/db/client.ts";
import type { DB, Todo } from "../../../datasources/db/types.ts";
import * as UserTodosLoader from "./user-todos.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(entities.users.alice, entities.users.admin);
  await seeders.todos(
    entities.todos.alice1,
    entities.todos.alice2,
    entities.todos.alice3,
    entities.todos.admin1,
  );
});

afterAll(async () => {
  await trx.rollback().execute();
});

const alice = entities.users.alice;
const admin = entities.users.admin;

const ids = (todos: Todo[]) => todos.map((todo) => todo.id);

describe("batchGet", () => {
  it("returns correct results for keys with different sortKey/limit in the same batch", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: alice.id,
        sortKey: "createdAt",
        reverse: false,
        limit: 2,
      }),
      loader.load({
        userId: alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 2,
      }),
    ]);

    expect(ids(result1)).toStrictEqual([entities.todos.alice1.id, entities.todos.alice2.id]);
    expect(ids(result2)).toStrictEqual([entities.todos.alice1.id, entities.todos.alice3.id]);
  });

  it("returns correct results for keys with different reverse in the same batch", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: alice.id,
        sortKey: "createdAt",
        reverse: false,
        limit: 50,
      }),
      loader.load({
        userId: alice.id,
        sortKey: "createdAt",
        reverse: true,
        limit: 50,
      }),
    ]);

    expect(ids(result1)).toStrictEqual([
      entities.todos.alice1.id,
      entities.todos.alice2.id,
      entities.todos.alice3.id,
    ]);
    expect(ids(result2)).toStrictEqual([
      entities.todos.alice3.id,
      entities.todos.alice2.id,
      entities.todos.alice1.id,
    ]);
  });

  it("returns correct results for keys with different status in the same batch", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 50,
        status: "pending",
      }),
      loader.load({
        userId: alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 50,
        status: "done",
      }),
    ]);

    expect(ids(result1)).toStrictEqual([entities.todos.alice1.id, entities.todos.alice3.id]);
    expect(ids(result2)).toStrictEqual([entities.todos.alice2.id]);
  });

  it("returns correct results for keys with different cursor in the same batch", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 2,
      }),
      loader.load({
        userId: alice.id,
        sortKey: "updatedAt",
        reverse: false,
        limit: 2,
        cursor: entities.todos.alice3.id,
      }),
    ]);

    expect(ids(result1)).toStrictEqual([entities.todos.alice1.id, entities.todos.alice3.id]);
    expect(ids(result2)).toStrictEqual([entities.todos.alice2.id]);
  });

  it("batches same-params keys of multiple users", async () => {
    const loader = UserTodosLoader.create(trx as unknown as ReadonlyKysely<DB>);

    const [result1, result2] = await Promise.all([
      loader.load({
        userId: alice.id,
        sortKey: "createdAt",
        reverse: false,
        limit: 50,
      }),
      loader.load({
        userId: admin.id,
        sortKey: "createdAt",
        reverse: false,
        limit: 50,
      }),
    ]);

    expect(result1).toHaveLength(3);
    expect(ids(result2)).toStrictEqual([entities.todos.admin1.id]);
  });
});
