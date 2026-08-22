import type { ControlledTransaction } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import * as todos from "../../../../domain/entities/_test/todos.ts";
import * as users from "../../../../domain/entities/_test/users.ts";
import { kysely } from "../../../datasources/db/client.ts";
import type { DB } from "../../../datasources/db/types.ts";
import { TodoRepo } from "../../../repositories/todo.ts";
import { UserRepo } from "../../../repositories/user.ts";
import * as UserTodoCountLoader from "./user-todo-count.ts";

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

describe("batchGet", () => {
  it("returns correct counts for keys with different status in the same batch", async () => {
    const loader = UserTodoCountLoader.create(trx as unknown as ReadonlyKysely<DB>);
    const [pending, done, all] = await Promise.all([
      loader.load({
        userId: users.entities.alice.id,
        status: "pending",
      }),
      loader.load({
        userId: users.entities.alice.id,
        status: "done",
      }),
      loader.load({
        userId: users.entities.alice.id,
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
        userId: users.entities.alice.id,
        search: "alice todo 1",
      }),
      loader.load({
        userId: users.entities.alice.id,
      }),
    ]);

    expect(searched).toBe(1);
    expect(all).toBe(3);
  });

  it("returns correct counts for keys of multiple users in the same batch", async () => {
    const loader = UserTodoCountLoader.create(trx as unknown as ReadonlyKysely<DB>);
    const [aliceCount, bobCount] = await Promise.all([
      loader.load({
        userId: users.entities.alice.id,
      }),
      loader.load({
        userId: users.entities.bob.id,
      }),
    ]);

    expect(aliceCount).toBe(3);
    expect(bobCount).toBe(1);
  });
});
