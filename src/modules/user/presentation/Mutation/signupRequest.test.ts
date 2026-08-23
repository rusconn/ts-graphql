import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../app/datasources/db/client.ts";
import {
  contexts,
  createContext,
  type ContextForIT,
} from "../../../../app/graphql/test/context.ts";
import type { MutationSignupRequestArgs } from "../../../../app/graphql/types.generated.ts";
import type { DB } from "../../../shared/mod.ts";
import { UserRepo } from "../../infrastructure/repositories/user.ts";
import { users } from "../../test.ts";
import { resolver } from "./signupRequest.ts";

let trx: ControlledTransaction<DB>;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  const userRepo = new UserRepo(trx);
  await users.seed(userRepo, users.entities.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function signupRequest(
  ctx: ContextForIT, //
  args: MutationSignupRequestArgs,
) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.guest;
    const args: MutationSignupRequestArgs = {
      email: "emailexample.com",
    };

    const result = await signupRequest(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["email"]);
  });
});

describe("usecase", () => {
  it("returns success when email is already taken", async () => {
    const ctx = contexts.guest;
    const args: MutationSignupRequestArgs = {
      email: users.dtos.alice.email,
    };

    const result = await signupRequest(ctx, args);
    assert(result?.__typename === "SignupRequestSuccess", result?.__typename);
  });
});
