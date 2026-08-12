import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { Credential, DB, User } from "../../src/infrastructure/datasources/db/types.ts";
import type { Uuidv7 } from "../../src/util/uuid/v7.ts";

export async function seedMinimal(trx: Transaction<DB>) {
  const handCredentials: Credential[] = [
    {
      userId: "0193cb3e-4379-750f-880f-77afae342259" as Uuidv7,
      /** raw: adminadmin */
      password:
        "$argon2id$v=19$m=65536,p=4,t=3$vzArUnpvvY1gAcrOwaq1JQ$6cmpvDIdWlHzR7N/ISjGX9w7rdTS0CxESFROLb6gpCo",
    },
    {
      userId: "0193cb3e-504f-72e9-897c-2c71f389f3ad" as Uuidv7,
      /** raw: hogehoge */
      password:
        "$argon2id$v=19$m=65536,p=4,t=3$/win4dcS2YJPdakBaptpVg$KjShVm9qI6GJMXnNAfJeME07vcxASxFz189WGrKQlWE",
    },
    {
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      /** raw: piyopiyo */
      password:
        "$argon2id$v=19$m=65536,p=4,t=3$NzmVR9HutOCYCo1qxILW+w$zXkW2HQ3OMJIFJ6mqUziu4k2lIpNU1JQUr47jQCqRu8",
    },
  ];

  await trx.insertInto("credentials").values(handCredentials).execute();
}

export async function seedBulk(trx: Transaction<DB>, userIds: User["id"][]) {
  const fakeCredentials = userIds.map((userId) => ({
    userId,
    password: "dummy",
  }));

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(fakeCredentials, 5_000);
  const inserts = chunks.map((cs) => trx.insertInto("credentials").values(cs).execute());
  await Promise.all(inserts);
}
