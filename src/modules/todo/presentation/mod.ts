import { resolver as todoCreate } from "./Mutation/todoCreate.ts";
import { resolver as todoDelete } from "./Mutation/todoDelete.ts";
import { resolver as todoStatusChange } from "./Mutation/todoStatusChange.ts";
import { resolver as todoUpdate } from "./Mutation/todoUpdate.ts";
import type { MutationResolvers, UserResolvers } from "./types.generated.ts";
import { resolver as todo } from "./User/todo.ts";
import { resolver as todos } from "./User/todos.ts";

export const Mutation: MutationResolvers = {
  todoCreate,
  todoDelete,
  todoStatusChange,
  todoUpdate,
};

export const User: UserResolvers = {
  todo,
  todos,
};

export { resolvers as Todo, nodeResolver as node } from "./Todo.ts";
