import type { UserTodosArgs } from "../../../../app/graphql/types.generated.ts";
import { getCursorConnection } from "../../../../lib/graphql/cursor-connections/get.ts";
import { checkStringSize } from "../../../../lib/string/check-size.ts";
import { cleanseText } from "../../../../lib/string/cleanse.ts";
import { badUserInputError, parseConnectionArgs } from "../../../shared/mod.ts";
import { assertUserOwner } from "../../../user/mod.ts";
import { parseTodoCursor } from "../parsers/todo/cursor.ts";
import { TodoSortKeys } from "../TodoSortKeys.ts";
import { TodoStatus } from "../TodoStatus.ts";
import type { UserResolvers } from "../types.generated.ts";

export const FIRST_MAX = 50;
export const LAST_MAX = 50;
const SEARCH_MAX_LEN = 30;

export const resolver: NonNullable<UserResolvers["todos"]> = async (parent, args, ctx, info) => {
  assertUserOwner(ctx, parent);

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
