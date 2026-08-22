import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type * as Dto from "../../../../application/dtos.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { TodoRepo } from "../../../../infrastructure/repositories/todo.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { contexts, createContext, type ContextForIT } from "../../yoga/_test/context.ts";
import {
  ErrorCode,
  type PageInfo,
  type ResolversParentTypes,
  TodoSortKeys,
  TodoStatus,
  type UserTodosArgs,
} from "../_types.ts";
import * as todos from "../Todo/_test.ts";
import * as users from "./_test.ts";
import { FIRST_MAX, resolver } from "./todos.ts";

let trx: ControlledTransaction<DB>;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  const userRepo = new UserRepo(trx);
  const todoRepo = new TodoRepo(trx);
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

async function todos_(
  ctx: ContextForIT, //
  parent: ResolversParentTypes["User"],
  args: UserTodosArgs,
) {
  return await resolver(parent, args, createContext(ctx, trx));
}

describe("access control", () => {
  it("throws forbidden when user is not owner", async () => {
    const ctx = contexts.bob;
    const parent: ResolversParentTypes["User"] = users.dtos.alice;
    const args: UserTodosArgs = {
      first: FIRST_MAX,
      reverse: false,
      sortKey: TodoSortKeys.CreatedAt,
    };

    await expect(todos_(ctx, parent, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });
});

describe("parsing", () => {
  const ctx = contexts.alice;
  const parent: ResolversParentTypes["User"] = users.dtos.alice;

  it("throws an input error when args are invalid", async () => {
    const args: UserTodosArgs = {
      first: FIRST_MAX + 1,
      reverse: true,
      sortKey: TodoSortKeys.UpdatedAt,
    };

    await expect(todos_(ctx, parent, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when args are valid", async () => {
    const args: UserTodosArgs = {
      first: FIRST_MAX,
      reverse: true,
      sortKey: TodoSortKeys.UpdatedAt,
    };

    try {
      await todos_(ctx, parent, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("order of items", () => {
  const ctx = contexts.alice;
  const parent: ResolversParentTypes["User"] = users.dtos.alice;

  const patterns: [UserTodosArgs, [Dto.Todo.Type, Dto.Todo.Type, Dto.Todo.Type]][] = [
    [
      { first: FIRST_MAX, reverse: false, sortKey: TodoSortKeys.CreatedAt },
      [todos.dtos.alice1, todos.dtos.alice2, todos.dtos.alice3],
    ],
    [
      { first: FIRST_MAX, reverse: true, sortKey: TodoSortKeys.CreatedAt },
      [todos.dtos.alice3, todos.dtos.alice2, todos.dtos.alice1],
    ],
    [
      { first: FIRST_MAX, reverse: false, sortKey: TodoSortKeys.UpdatedAt },
      [todos.dtos.alice1, todos.dtos.alice3, todos.dtos.alice2],
    ],
    [
      { first: FIRST_MAX, reverse: true, sortKey: TodoSortKeys.UpdatedAt },
      [todos.dtos.alice2, todos.dtos.alice3, todos.dtos.alice1],
    ],
  ];

  it.each(patterns)("returns todos in correct order: %#", async (args, expectedTodos) => {
    const result = await todos_(ctx, parent, args);
    assert(result?.nodes);
    expect(result?.nodes).toStrictEqual(expectedTodos);
  });
});

describe("pagination", () => {
  const ctx = contexts.alice;
  const parent: ResolversParentTypes["User"] = users.dtos.alice;

  it("should not works by default", async () => {
    const args: UserTodosArgs = {
      first: 1,
      reverse: true,
      sortKey: TodoSortKeys.UpdatedAt,
    };

    const result1 = await todos_(ctx, parent, args);
    const result2 = await todos_(ctx, parent, args);

    expect(result1?.nodes).toHaveLength(1);
    expect(result2?.nodes).toHaveLength(1);
    expect(result1).toStrictEqual(result2);
  });

  describe("cursor", () => {
    type Excpect = {
      length: number;
      todos: Dto.Todo.Type[];
      pageInfo: PageInfo;
    };

    type MakeCursor = (pageInfo: PageInfo) => Pick<UserTodosArgs, "after" | "before">;

    const patterns: [UserTodosArgs, Excpect, MakeCursor, Excpect][] = [
      [
        { first: 2, reverse: false, sortKey: TodoSortKeys.UpdatedAt },
        {
          length: 2,
          todos: [todos.dtos.alice1, todos.dtos.alice3],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: todos.dtos.alice1.id,
            endCursor: todos.dtos.alice3.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.endCursor != null && {
            after: pageInfo.endCursor,
          }),
        }),
        {
          length: 1,
          todos: [todos.dtos.alice2],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: todos.dtos.alice2.id,
            endCursor: todos.dtos.alice2.id,
          },
        },
      ],
      [
        { first: 2, reverse: true, sortKey: TodoSortKeys.UpdatedAt },
        {
          length: 2,
          todos: [todos.dtos.alice2, todos.dtos.alice3],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: todos.dtos.alice2.id,
            endCursor: todos.dtos.alice3.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.endCursor != null && {
            after: pageInfo.endCursor,
          }),
        }),
        {
          length: 1,
          todos: [todos.dtos.alice1],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: todos.dtos.alice1.id,
            endCursor: todos.dtos.alice1.id,
          },
        },
      ],
      [
        { last: 2, reverse: false, sortKey: TodoSortKeys.UpdatedAt },
        {
          length: 2,
          todos: [todos.dtos.alice3, todos.dtos.alice2],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: todos.dtos.alice3.id,
            endCursor: todos.dtos.alice2.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.startCursor != null && {
            before: pageInfo.startCursor,
          }),
        }),
        {
          length: 1,
          todos: [todos.dtos.alice1],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: todos.dtos.alice1.id,
            endCursor: todos.dtos.alice1.id,
          },
        },
      ],
      [
        { last: 2, reverse: true, sortKey: TodoSortKeys.UpdatedAt },
        {
          length: 2,
          todos: [todos.dtos.alice3, todos.dtos.alice1],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: todos.dtos.alice3.id,
            endCursor: todos.dtos.alice1.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.startCursor != null && {
            before: pageInfo.startCursor,
          }),
        }),
        {
          length: 1,
          todos: [todos.dtos.alice2],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: todos.dtos.alice2.id,
            endCursor: todos.dtos.alice2.id,
          },
        },
      ],
    ];

    test.each(patterns)("patterns %#", async (args, firstExpect, makeCursor, secondExpect) => {
      const result1 = await todos_(ctx, parent, args);
      assert(result1?.nodes);
      expect(result1.nodes.length).toBe(firstExpect.length);
      expect(result1.pageInfo).toStrictEqual(firstExpect.pageInfo);
      expect(result1.nodes).toStrictEqual(firstExpect.todos);

      const result2 = await todos_(ctx, parent, { ...args, ...makeCursor(result1.pageInfo) });
      assert(result2?.nodes);
      expect(result2.nodes.length).toBe(secondExpect.length);
      expect(result2.pageInfo).toStrictEqual(secondExpect.pageInfo);
      expect(result2.nodes).toStrictEqual(secondExpect.todos);
    });
  });
});

describe("filter by status", () => {
  const ctx = contexts.alice;
  const parent: ResolversParentTypes["User"] = users.dtos.alice;

  const patterns: [UserTodosArgs, Dto.Todo.Type[]][] = [
    [
      {
        first: FIRST_MAX,
        reverse: false,
        sortKey: TodoSortKeys.UpdatedAt,
      },
      [todos.dtos.alice1, todos.dtos.alice3, todos.dtos.alice2],
    ],
    [
      {
        first: FIRST_MAX,
        reverse: false,
        sortKey: TodoSortKeys.UpdatedAt,
        status: TodoStatus.Done,
      },
      [todos.dtos.alice2],
    ],
    [
      {
        first: FIRST_MAX,
        reverse: false,
        sortKey: TodoSortKeys.UpdatedAt,
        status: TodoStatus.Pending,
      },
      [todos.dtos.alice1, todos.dtos.alice3],
    ],
  ];

  test.each(patterns)("patterns %#", async (args, expectedTodos) => {
    const result = await todos_(ctx, parent, args);
    assert(result?.nodes);
    expect(result.nodes).toHaveLength(expectedTodos.length);
    expect(result.nodes).toStrictEqual(expectedTodos);
  });
});

describe("filter by search", () => {
  const ctx = contexts.alice;
  const parent: ResolversParentTypes["User"] = users.dtos.alice;

  it("filters todos by search term", async () => {
    const result = await todos_(ctx, parent, {
      first: FIRST_MAX,
      reverse: false,
      sortKey: TodoSortKeys.UpdatedAt,
      search: "todo 1",
    });
    assert(result?.nodes);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes).toStrictEqual([todos.dtos.alice1]);
    expect(result.totalCount).toBe(1);
  });

  it("returns all matching todos", async () => {
    const result = await todos_(ctx, parent, {
      first: FIRST_MAX,
      reverse: false,
      sortKey: TodoSortKeys.UpdatedAt,
      search: "alice todo",
    });
    assert(result?.nodes);
    expect(result.nodes).toHaveLength(3);
    expect(result.totalCount).toBe(3);
  });

  it("returns empty when search term has no match", async () => {
    const result = await todos_(ctx, parent, {
      first: FIRST_MAX,
      reverse: false,
      sortKey: TodoSortKeys.UpdatedAt,
      search: "nonexistent",
    });
    assert(result?.nodes);
    expect(result.nodes).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });

  it("cleanses the search term before filtering", async () => {
    const result = await todos_(ctx, parent, {
      first: FIRST_MAX,
      reverse: false,
      sortKey: TodoSortKeys.UpdatedAt,
      search: "　todo\u200B 1　",
    });
    assert(result?.nodes);
    expect(result.nodes).toStrictEqual([todos.dtos.alice1]);
    expect(result.totalCount).toBe(1);
  });

  it("throws an error when search term is too long", async () => {
    const longSearch = "a".repeat(31);
    await expect(
      todos_(ctx, parent, {
        first: FIRST_MAX,
        reverse: false,
        sortKey: TodoSortKeys.UpdatedAt,
        search: longSearch,
      }),
    ).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });
});
