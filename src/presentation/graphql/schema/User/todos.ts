import { getCursorConnection } from "../../../../lib/graphql/cursor-connections/mod.ts";
import { checkStringSize } from "../../../../lib/string/check-size.ts";
import { cleanseText } from "../../../../lib/string/cleanse.ts";
import { assertAdminOrUserOwner } from "../_authorizers/user/admin-or-owner.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { parseConnectionArgs } from "../_parsers/connection-args.ts";
import { parseTodoCursor } from "../_parsers/todo/cursor.ts";
import { TodoSortKeys, TodoStatus, type UserResolvers, type UserTodosArgs } from "../_types.ts";

export const FIRST_MAX = 50;
export const LAST_MAX = 50;
const SEARCH_MAX_LEN = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    """
    本人、管理者のみ
    """
    todos(
      """
      max: ${FIRST_MAX}
      """
      first: Int

      after: String

      """
      max: ${LAST_MAX}
      """
      last: Int

      before: String

      reverse: Boolean! = true

      sortKey: TodoSortKeys! = UPDATED_AT

      """
      指定すると絞り込む
      """
      status: TodoStatus

      """
      指定するとtitle及びdescriptionを検索する、${SEARCH_MAX_LEN}文字まで
      """
      search: String
    ): TodoConnection @semanticNonNull @complexity(value: 3, multipliers: ["first", "last"])
  }

  enum TodoSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  type TodoConnection {
    pageInfo: PageInfo! @complexity(value: 1, perInstance: true)
    edges: [TodoEdge] @semanticNonNull(levels: [0, 1])
    nodes: [Todo] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull @complexity(value: 5, perInstance: true)
  }

  type TodoEdge {
    cursor: String!
    node: Todo @semanticNonNull
  }
`;

export const resolver: NonNullable<UserResolvers["todos"]> = async (parent, args, ctx, info) => {
  assertAdminOrUserOwner(ctx, parent);

  const parsed = parseArgs(args);
  if (Error.isError(parsed)) {
    throw badUserInputError(parsed.message, parsed);
  }

  const { connectionArgs, reverse, sortKey, filter } = parsed;

  return await getCursorConnection(
    ({ backward, ...exceptBackward }) =>
      ctx.queries.todo.pageByUser({
        userId: parent.id,
        sortKey,
        reverse: reverse !== backward,
        ...exceptBackward,
        ...filter,
      }),
    () =>
      ctx.queries.todo.countByUser({
        userId: parent.id,
        ...filter,
      }),
    connectionArgs,
    { resolveInfo: info! },
  );
};

function parseArgs(args: UserTodosArgs) {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseTodoCursor,
  });
  if (Error.isError(connectionArgs)) {
    return connectionArgs;
  }

  const searchToUse = cleanseText(args.search ?? "");
  const checkResult = checkStringSize(searchToUse, {
    maxGraphemes: SEARCH_MAX_LEN,
  });
  switch (checkResult.kind) {
    case "ok":
      break;
    case "too-large":
      throw new Error("unreachable");
    case "too-long":
      return new Error("search too long");
    case "too-short":
      throw new Error("unreachable");
    default:
      throw new Error(checkResult satisfies never);
  }

  return {
    connectionArgs,
    reverse: args.reverse,
    sortKey: {
      [TodoSortKeys.CreatedAt]: "createdAt" as const,
      [TodoSortKeys.UpdatedAt]: "updatedAt" as const,
    }[args.sortKey],
    filter: {
      ...(args.status != null && {
        status: {
          [TodoStatus.Done]: "done" as const,
          [TodoStatus.Pending]: "pending" as const,
        }[args.status],
      }),
      ...(searchToUse !== "" && {
        search: searchToUse,
      }),
    },
  };
}
