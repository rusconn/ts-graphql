import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../app/datasources/db/client.ts";
import {
  contexts,
  createContext,
  type ContextForIT,
} from "../../../../app/graphql/test/context.ts";
import type { MutationAccountDeleteArgs } from "../../../../app/graphql/types.generated.ts";
import { RefreshTokenQuery, RefreshTokenRepo, refreshTokens } from "../../../session/test.ts";
import type { DB } from "../../../shared/mod.ts";
import { TodoQuery, TodoRepo, todos } from "../../../todo/test.ts";
import { Entity as User } from "../../domain/entities/user.ts";
import { CredentialQuery } from "../../infrastructure/queries/test/credential.ts";
import { UserQuery } from "../../infrastructure/queries/test/user.ts";
import { UserRepo } from "../../infrastructure/repositories/user.ts";
import { users } from "../../test.ts";
import { resolver } from "./accountDelete.ts";

let trx: ControlledTransaction<DB>;
let credentialQuery: CredentialQuery;
let refreshTokenQuery: RefreshTokenQuery;
let todoQuery: TodoQuery;
let userQuery: UserQuery;
let refreshTokenRepo: RefreshTokenRepo;
let todoRepo: TodoRepo;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  credentialQuery = new CredentialQuery(trx);
  refreshTokenQuery = new RefreshTokenQuery(trx);
  todoQuery = new TodoQuery(trx);
  userQuery = new UserQuery(trx);
  refreshTokenRepo = new RefreshTokenRepo(trx);
  todoRepo = new TodoRepo(trx);
  const userRepo = new UserRepo(trx);
  await users.seed(userRepo, users.entities.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

async function accountDelete(ctx: ContextForIT, args: MutationAccountDeleteArgs) {
  return await resolver({}, args, createContext(ctx, trx));
}

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountDeleteArgs = {
      password: "a".repeat(User.Password.MIN_GRAPHEMES - 1),
    };

    const before = await Promise.all([
      credentialQuery.findOrThrow(ctx.user.id),
      userQuery.findOrThrow(ctx.user.id),
    ]);

    const result = await accountDelete(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["password"]);

    const after = await Promise.all([
      credentialQuery.findOrThrow(ctx.user.id),
      userQuery.findOrThrow(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = contexts.alice;
    const args: MutationAccountDeleteArgs = {
      password: "alicealice",
    };

    const result = await accountDelete(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("deletes account and its resources", async () => {
    await todos.seed(todoRepo, todos.entities.alice1, todos.entities.alice2);
    await refreshTokens.seed(refreshTokenRepo, refreshTokens.entities.alice);
    const ctx = contexts.alice;
    const args: MutationAccountDeleteArgs = {
      password: "alicealice",
    };

    const before = await Promise.all([
      todoQuery.countTheirs(users.dtos.alice.id),
      refreshTokenQuery.countTheirs(users.dtos.alice.id),
      userQuery.count(),
    ]);
    expect(before[0]).toBe(2);
    expect(before[1]).toBe(1);
    expect(before[2]).toBe(1);

    const result = await accountDelete(ctx, args);
    assert(result?.__typename === "AccountDeleteSuccess", result?.__typename);
    expect(result.id).toBe(users.nodes.alice.id);

    const after = await Promise.all([
      todoQuery.countTheirs(users.dtos.alice.id),
      refreshTokenQuery.countTheirs(users.dtos.alice.id),
      userQuery.count(),
    ]);
    expect(after[0]).toBe(0);
    expect(after[1]).toBe(0);
    expect(after[2]).toBe(0);
  });
});
