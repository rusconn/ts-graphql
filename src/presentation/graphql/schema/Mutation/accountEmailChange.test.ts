import { omit } from "es-toolkit";
import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { UserQuery } from "../../../../infrastructure/queries/_test/user.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { contexts, createContext, type ContextForIT } from "../../yoga/_test/context.ts";
import type { MutationAccountEmailChangeArgs } from "../_types.ts";
import * as users from "../User/_test.ts";
import { resolver } from "./accountEmailChange.ts";

let trx: ControlledTransaction<DB>;
let userQuery: UserQuery;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  userQuery = new UserQuery(trx);
  const userRepo = new UserRepo(trx);
  await users.seed(userRepo, users.entities.alice, users.entities.bob);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function accountEmailChange(
  ctx: ContextForIT, //
  args: MutationAccountEmailChangeArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountEmailChangeArgs = {
      email: "emailexample.com",
    };

    const before = await userQuery.findOrThrow(ctx.user.id);

    const result = await accountEmailChange(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["email"]);

    const after = await userQuery.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountEmailChangeArgs = {
      email: "email@example.com",
    };

    const result = await accountEmailChange(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("returns an error when email already taken", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountEmailChangeArgs = {
      email: users.dtos.bob.email,
    };

    const result = await accountEmailChange(ctx, args);
    expect(result?.__typename).toBe("EmailAlreadyTakenError");

    // DBの一意制約違反発生時にトランザクションがabortされるのでafterの取得ができない。
  });

  it("changes email using args", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountEmailChangeArgs = {
      email: "email@example.com",
    };

    const before = await userQuery.findOrThrow(ctx.user.id);

    const result = await accountEmailChange(ctx, args);
    assert(result?.__typename === "AccountEmailChangeSuccess", result?.__typename);
    const changed = result.user;
    expect(omit(changed, ["email", "updatedAt"])).toStrictEqual(
      omit(before, ["email", "updatedAt"]),
    );
    expect(changed.email).toBe("email@example.com");
    expect(changed.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await userQuery.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(changed);
  });
});
