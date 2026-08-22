import { SignJWT } from "jose";
import type { ControlledTransaction } from "kysely";

import * as EmailVerification from "../../../../application/usecases/signup/_email-verification.ts";
import { signingKey } from "../../../../config/signup-email-verification.ts";
import { User } from "../../../../domain/entities.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { UserQuery } from "../../../../infrastructure/queries/_test/user.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { contexts, createContext, type ContextForIT } from "../../yoga/_test/context.ts";
import type { MutationSignupCompleteArgs } from "../_types.ts";
import * as users from "../User/_test.ts";
import { resolver as signupComplete } from "./signupComplete.ts";
import { resolver as signupRequest } from "./signupRequest.ts";

let trx: ControlledTransaction<DB>;
let userQuery: UserQuery;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  userQuery = new UserQuery(trx);
  const userRepo = new UserRepo(trx);
  await users.seed(userRepo, users.entities.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function complete(
  ctx: ContextForIT, //
  args: MutationSignupCompleteArgs,
) {
  return await signupComplete({}, args, createContext(ctx, trx));
}

async function doSignupRequest(email: User.Email.Type) {
  const result = await signupRequest({}, { email }, createContext(contexts.guest, trx));
  assert(result?.__typename === "SignupRequestSuccess", result?.__typename);
  return await EmailVerification.sign(email);
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const args: MutationSignupCompleteArgs = {
      token: "token",
      name: "name",
      password: "pass",
    };

    const result = await complete(contexts.guest, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["password"]);
  });
});

describe("usecase", () => {
  it("not completes when token is unknown", async () => {
    const args: MutationSignupCompleteArgs = {
      token: "not-a-jwt",
      name: "name",
      password: "password",
    };

    const result = await complete(contexts.guest, args);
    assert(result?.__typename === "InvalidVerificationTokenError", result?.__typename);

    const count = await userQuery.count();
    expect(count).toBe(1);
  });

  it("not completes when token is tampered", async () => {
    const email = User.Email.parse("tampered@example.com")._unsafeUnwrap();
    const [header, payload, signature] = (await EmailVerification.sign(email)).split(".");
    const args: MutationSignupCompleteArgs = {
      token: [header, payload, `${signature}x`].join("."),
      name: "name",
      password: "password",
    };

    const result = await complete(contexts.guest, args);
    assert(result?.__typename === "InvalidVerificationTokenError", result?.__typename);
  });

  it("not completes when token is expired", async () => {
    const email = User.Email.parse("expired@example.com")._unsafeUnwrap();
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(signingKey);
    const args: MutationSignupCompleteArgs = {
      token,
      name: "name",
      password: "password",
    };

    const result = await complete(contexts.guest, args);
    assert(result?.__typename === "ExpiredVerificationTokenError", result?.__typename);
  });

  it("completes using args", async () => {
    const email = User.Email.parse("complete@example.com")._unsafeUnwrap();
    const token = await doSignupRequest(email);
    const args: MutationSignupCompleteArgs = {
      token,
      name: "name",
      password: "password",
    };

    const result = await complete(contexts.guest, args);
    assert(result?.__typename === "SignupCompleteSuccess", result?.__typename);
    const _accessToken = result.accessToken; // 使えることはE2Eで検証する
    const _refreshToken = result.refreshToken; // 使えることはE2Eで検証する

    const count = await userQuery.count();
    expect(count).toBe(2);
  });

  it("not completes when token is already used", async () => {
    const email = User.Email.parse("used@example.com")._unsafeUnwrap();
    const token = await doSignupRequest(email);

    const first = await complete(contexts.guest, { token, name: "name", password: "password" });
    assert(first?.__typename === "SignupCompleteSuccess", first?.__typename);

    const second = await complete(contexts.guest, { token, name: "name", password: "password" });
    assert(second?.__typename === "EmailAlreadyTakenError", second?.__typename);
  });
});
