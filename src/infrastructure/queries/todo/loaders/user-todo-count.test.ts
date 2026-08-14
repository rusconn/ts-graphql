import type { ControlledTransaction } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import {
  createSeeders,
  type Seeders,
} from "../../../../presentation/_shared/test/helpers/helpers.ts";
import { domain } from "../../../../presentation/graphql/schema/_test/data.ts";
import { kysely } from "../../../datasources/db/client.ts";
import type { DB } from "../../../datasources/db/types.ts";
import * as UserTodoCountLoader from "./user-todo-count.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(domain.users.alice, domain.users.admin);
  await seeders.todos(
    domain.todos.alice1,
    domain.todos.alice2,
    domain.todos.alice3,
    domain.todos.admin1,
  );
});

afterAll(async () => {
  await trx.rollback().execute();
});

const alice = domain.users.alice;

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
});
