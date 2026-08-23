import { assertAuthenticated } from "../../../../app/graphql/authorizers/authenticated.ts";
import type { MutationTodoStatusChangeArgs } from "../../../../app/graphql/types.generated.ts";
import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { badUserInputError, internalServerError } from "../../../shared/mod.ts";
import { changeTodoStatus } from "../../application/usecases/change-todo-status.ts";
import { parseTodoStatus } from "../parsers/todo/status.ts";
import { parseTodoId } from "../Todo/id.ts";
import type { MutationResolvers } from "../types.generated.ts";

export const resolver: MutationResolvers["todoStatusChange"] = async (_parent, args, ctx) => {
  assertAuthenticated(ctx);

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputError(e);
  });

  const status = unwrapOrElse(parseArgs(args), (e) => {
    throw internalServerError(e);
  });

  const result = await changeTodoStatus(ctx, { id, status });
  switch (result.type) {
    case "TodoNotFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified todo does not exist.",
      };
    case "UnexpectedFailure":
      throw internalServerError(result.cause);
    case "Success":
      return {
        __typename: "TodoStatusChangeSuccess",
        todo: result.changed,
      };
    default:
      throw new Error(result satisfies never);
  }
};

function parseArgs(args: MutationTodoStatusChangeArgs) {
  return parseTodoStatus(args, "status", {
    optional: false,
    nullable: false,
  });
}
