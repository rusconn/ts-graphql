import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { entities, dtos, nodes } from "../_test/data.ts";
import { type ContextForIT, contexts } from "../_test/data.ts";
import { createContext, dummyId } from "../_test/helpers.ts";
import { ErrorCode, type QueryUserArgs } from "../_types.ts";
import { resolver } from "./user.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(entities.users.alice, entities.users.admin);
});

afterAll(async () => {
  await trx.rollback().execute();
});

async function user(
  ctx: ContextForIT, //
  args: QueryUserArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = contexts.admin;
    const args: QueryUserArgs = {
      id: "bad-id",
    };

    await expect(user(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = contexts.admin;
    const args: QueryUserArgs = {
      id: dummyId.user(),
    };

    try {
      await user(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("logic", () => {
  it("returns null when id not exists on graph", async () => {
    const ctx = contexts.admin;
    const args: QueryUserArgs = {
      id: dummyId.user(),
    };

    const result = await user(ctx, args);
    expect(result).toBeNull();
  });

  it("returns user when client does not own user", async () => {
    const ctx = contexts.admin;
    const args: QueryUserArgs = {
      id: nodes.users.admin.id,
    };

    const result = await user(ctx, args);
    expect(result?.id).toBe(dtos.users.admin.id);
  });

  it("returns user when client owns the user", async () => {
    const ctx = contexts.admin;
    const args: QueryUserArgs = {
      id: nodes.users.alice.id,
    };

    const result = await user(ctx, args);
    expect(result?.id).toBe(dtos.users.alice.id);
  });
});
