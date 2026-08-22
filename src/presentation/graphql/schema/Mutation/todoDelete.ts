import { deleteTodo } from "../../../../application/usecases/delete-todo.ts";
import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { assertAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { MutationResolvers } from "../_types.ts";
import { parseTodoId, toTodoId } from "../Todo/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    """
    ログイン済のみ
    """
    todoDelete(id: ID!): TodoDeleteResult @semanticNonNull @complexity(value: 50)
  }

  union TodoDeleteResult = TodoDeleteSuccess | ResourceNotFoundError

  type TodoDeleteSuccess {
    id: ID!
  }
`;

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
