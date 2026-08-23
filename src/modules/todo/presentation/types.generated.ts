import type * as Types from "../../../app/graphql/types.generated.ts";
interface DefinedFields {
  Mutation: 'todoCreate' | 'todoDelete' | 'todoStatusChange' | 'todoUpdate';
  TodoCreateSuccess: 'todo' | 'todoEdge';
  TodoDeleteSuccess: 'id';
  TodoStatusChangeSuccess: 'todo';
  TodoUpdateSuccess: 'todo';
  Todo: 'title' | 'description' | 'status' | 'createdAt' | 'updatedAt' | 'id' | 'user';
  TodoConnection: 'pageInfo' | 'edges' | 'nodes' | 'totalCount';
  TodoEdge: 'cursor' | 'node';
  User: 'todo' | 'todos';
};

interface DefinedEnumValues {
  TodoStatus: 'DONE' | 'PENDING';
  TodoSortKeys: 'CREATED_AT' | 'UPDATED_AT';
};

export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
export type TodoCreateResult = Types.TodoCreateResult;
export type TodoCreateSuccess = Pick<Types.TodoCreateSuccess, DefinedFields['TodoCreateSuccess']>;
export type InvalidInputErrors = Types.InvalidInputErrors;
export type ResourceLimitExceededError = Types.ResourceLimitExceededError;
export type Todo = Pick<Types.Todo, DefinedFields['Todo']>;
export type TodoEdge = Pick<Types.TodoEdge, DefinedFields['TodoEdge']>;
export type TodoDeleteResult = Types.TodoDeleteResult;
export type TodoDeleteSuccess = Pick<Types.TodoDeleteSuccess, DefinedFields['TodoDeleteSuccess']>;
export type ResourceNotFoundError = Types.ResourceNotFoundError;
export type TodoStatusChangeResult = Types.TodoStatusChangeResult;
export type TodoStatus = DefinedEnumValues['TodoStatus'];
export type TodoStatusChangeSuccess = Pick<Types.TodoStatusChangeSuccess, DefinedFields['TodoStatusChangeSuccess']>;
export type TodoUpdateResult = Types.TodoUpdateResult;
export type TodoUpdateSuccess = Pick<Types.TodoUpdateSuccess, DefinedFields['TodoUpdateSuccess']>;
export type DateTimeISO = Types.DateTimeIso;
export type Node = Types.Node;
export type User = Types.User;
export type TodoConnection = Pick<Types.TodoConnection, DefinedFields['TodoConnection']>;
export type TodoSortKeys = DefinedEnumValues['TodoSortKeys'];
export type PageInfo = Types.PageInfo;

export type MutationResolvers = Required<Pick<Types.MutationResolvers, DefinedFields['Mutation']>>;
export type TodoCreateSuccessResolvers = Pick<Types.TodoCreateSuccessResolvers, DefinedFields['TodoCreateSuccess'] | '__isTypeOf'>;
export type TodoDeleteSuccessResolvers = Pick<Types.TodoDeleteSuccessResolvers, DefinedFields['TodoDeleteSuccess'] | '__isTypeOf'>;
export type TodoStatusChangeSuccessResolvers = Pick<Types.TodoStatusChangeSuccessResolvers, DefinedFields['TodoStatusChangeSuccess'] | '__isTypeOf'>;
export type TodoUpdateSuccessResolvers = Pick<Types.TodoUpdateSuccessResolvers, DefinedFields['TodoUpdateSuccess'] | '__isTypeOf'>;
export type TodoResolvers = Pick<Types.TodoResolvers, DefinedFields['Todo'] | '__isTypeOf'>;
export type TodoConnectionResolvers = Pick<Types.TodoConnectionResolvers, DefinedFields['TodoConnection']>;
export type TodoEdgeResolvers = Pick<Types.TodoEdgeResolvers, DefinedFields['TodoEdge']>;
export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User']>;

export interface Resolvers {
  Mutation: MutationResolvers;
  TodoCreateSuccess?: TodoCreateSuccessResolvers;
  TodoDeleteSuccess?: TodoDeleteSuccessResolvers;
  TodoStatusChangeSuccess?: TodoStatusChangeSuccessResolvers;
  TodoUpdateSuccess?: TodoUpdateSuccessResolvers;
  Todo?: TodoResolvers;
  TodoConnection?: TodoConnectionResolvers;
  TodoEdge?: TodoEdgeResolvers;
  User?: UserResolvers;
};