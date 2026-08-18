import type { ControlledTransaction } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import {
  createSeeders,
  type Seeders,
} from "../../../../presentation/_shared/test/helpers/helpers.ts";
import { entities } from "../../../../presentation/graphql/schema/_test/data.ts";
import { kysely } from "../../../datasources/db/client.ts";
import type { DB } from "../../../datasources/db/types.ts";
import * as UserTodoCountLoader from "./user-todo-count.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(entities.users.alice);
  await seeders.users(entities.users.bob);
  await seeders.todos(entities.todos.alice1, entities.todos.alice2, entities.todos.alice3);
  await seeders.todos(entities.todos.bob1);
});

afterAll(async () => {
  await trx.rollback().execute();
});

const alice = entities.users.alice;
const bob = entities.users.bob;

describe("batchGet", () => {
  it("returns correct counts for keys with different status in the same batch", async () => {
    const loader = UserTodoCountLoader.create(trx as unknown as ReadonlyKysely<DB>);
    const [pending, done, all] = await Promise.all([
      loader.load({
        userId: alice.id,
        status: "pending",
      }),
      loader.load({
        userId: alice.id,
        status: "done",
      }),
      loader.load({
        userId: alice.id,
      }),
    ]);

    expect(pending).toBe(2);
    expect(done).toBe(1);
    expect(all).toBe(3);
  });

  it("returns correct counts for keys with different search in the same batch", async () => {
    const loader = UserTodoCountLoader.create(trx as unknown as ReadonlyKysely<DB>);
    const [searched, all] = await Promise.all([
      loader.load({
        userId: alice.id,
        search: "alice todo 1",
      }),
      loader.load({
        userId: alice.id,
      }),
    ]);

    expect(searched).toBe(1);
    expect(all).toBe(3);
  });

  it("returns correct counts for keys of multiple users in the same batch", async () => {
    const loader = UserTodoCountLoader.create(trx as unknown as ReadonlyKysely<DB>);
    const [aliceCount, bobCount] = await Promise.all([
      loader.load({
        userId: alice.id,
      }),
      loader.load({
        userId: bob.id,
      }),
    ]);

    expect(aliceCount).toBe(3);
    expect(bobCount).toBe(1);
  });
});
