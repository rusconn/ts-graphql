import { assertAuthenticated } from "../../../../app/graphql/authorizers/authenticated.ts";
import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { badUserInputError, internalServerError } from "../../../shared/mod.ts";
import { deleteTodo } from "../../application/usecases/delete-todo.ts";
import { parseTodoId, toTodoId } from "../Todo/id.ts";
import type { MutationResolvers } from "../types.generated.ts";

export const resolver: MutationResolvers["todoDelete"] = async (_parent, args, ctx) => {
  assertAuthenticated(ctx);

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputError(e);
  });

  const result = await deleteTodo(ctx, { id });
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
        __typename: "TodoDeleteSuccess",
        id: toTodoId(result.deletedId),
      };
    default:
      throw new Error(result satisfies never);
  }
};
