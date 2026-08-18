import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import * as Entities from "../../src/domain/entities.ts";
import { type DB, type User } from "../../src/infrastructure/datasources/db/types.ts";
import type { Uuidv7 } from "../../src/util/uuid/v7.ts";

export async function seedMinimal(trx: Transaction<DB>) {
  const handUsers: User[] = [
    {
      id: "0193cb3e-504f-72e9-897c-2c71f389f3ad" as Uuidv7,
      name: "hoge",
      email: "hoge@example.com",
      createdAt: new Date("2024-12-15T16:54:38.927Z"),
      updatedAt: new Date("2024-12-15T16:54:38.927Z"),
    },
    {
      id: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      name: "piyo",
      email: "piyo@example.com",
      createdAt: new Date("2024-12-15T16:54:41.150Z"),
      updatedAt: new Date("2024-12-15T16:54:41.151Z"),
    },
  ];

  await trx.insertInto("users").values(handUsers).execute();
}

export async function seedBulk(trx: Transaction<DB>, numFakes: number) {
  const fakeUsers = fakeData(numFakes);

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(fakeUsers, 5_000);
  const inserts = chunks.map((us) => trx.insertInto("users").values(us).execute());

  await Promise.all(inserts);

  return fakeUsers.map((user) => user.id);
}

function fakeData(numFakes: number) {
  return [...Array(numFakes)].map((_, i) => fakeDataOne(i));
}

function fakeDataOne(nth: number): User {
  const id = Entities.User.Id.create();

  return {
    id,
    name: `user-${nth}`,
    email: `user-${nth}@example.com`,
    createdAt: Entities.User.Id.date(id),
    updatedAt: Entities.User.Id.date(id),
  };
}
