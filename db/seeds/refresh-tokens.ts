import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB, RefreshToken, User } from "../../src/infrastructure/datasources/db/types.ts";
import { addDates } from "../../src/lib/date-immutable.ts";
import type { Uuidv7 } from "../../src/util/uuid/v7.ts";

export async function seedMinimal(trx: Transaction<DB>) {
  const handRefreshTokens: RefreshToken[] = [
    {
      /** raw: e9b7e901-5fe4-4088-a8c5-96f934707c56 */
      token: "03081698430917834caea5e6a905b6b2ca64a975d9f19cb55ab90aefceb20aa7",
      userId: "0193cb3e-504f-72e9-897c-2c71f389f3ad" as Uuidv7,
      expiresAt: addDates(new Date(), 7),
      createdAt: new Date(),
    },
    {
      /** raw: c91fcf2d-5b15-451b-885b-a93b88094961 */
      token: "4614fa8297965eec43cd97a81137da1ffcdaaf55b8cb1399aa8b4c6a73ee390e",
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      expiresAt: addDates(new Date(), 7),
      createdAt: new Date(),
    },
  ];

  await trx.insertInto("refreshTokens").values(handRefreshTokens).execute();
}

export async function seedBulk(trx: Transaction<DB>, userIds: User["id"][]) {
  // 8割のユーザーがログイン中と想定
  const loggedInUserIds = userIds.slice(0, Math.round(userIds.length * 0.8));
  const fakeRefreshTokens = loggedInUserIds.map(fakeDataOne);

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(fakeRefreshTokens, 5_000);
  const inserts = chunks.map((uts) => trx.insertInto("refreshTokens").values(uts).execute());
  await Promise.all(inserts);
}

function fakeDataOne(userId: User["id"]): RefreshToken {
  const createdAt = new Date("2026-01-01T00:00:00Z");
  const expiresAt = addDates(createdAt, 7);
  return {
    token: `dummy-${userId}`,
    userId,
    expiresAt,
    createdAt,
  };
}
