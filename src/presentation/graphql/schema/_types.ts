import type { ID } from './ID.ts';
import type { EmailAddress } from './EmailAddress.ts';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { Node as NodeMapper } from './Node/_mapper.ts';
import type { Todo as TodoMapper } from './Todo/_mapper.ts';
import type { User as UserMapper } from './User/_mapper.ts';
import type { Context } from '../yoga/contexts.ts';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: ID; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: Date; output: Date; }
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  EmailAddress: { input: EmailAddress; output: EmailAddress; }
  /** Represents NULL values */
  Void: { input: void; output: void; }
};

export type AccessTokenRefreshResult = AccessTokenRefreshSuccess | InvalidRefreshTokenError | RefreshTokenExpiredError | RefreshTokenReuseError;

export type AccessTokenRefreshSuccess = {
  __typename?: 'AccessTokenRefreshSuccess';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type AccountDeleteResult = AccountDeleteSuccess | IncorrectPasswordError | InvalidInputErrors;

export type AccountDeleteSuccess = {
  __typename?: 'AccountDeleteSuccess';
  id: Scalars['ID']['output'];
};

export type AccountEmailChangeResult = AccountEmailChangeSuccess | EmailAlreadyTakenError | InvalidInputErrors;

export type AccountEmailChangeSuccess = {
  __typename?: 'AccountEmailChangeSuccess';
  user: User;
};

export type AccountPasswordChangeResult = AccountPasswordChangeSuccess | IncorrectOldPasswordError | InvalidInputErrors | NewPasswordSameAsOldError;

export type AccountPasswordChangeSuccess = {
  __typename?: 'AccountPasswordChangeSuccess';
  user: User;
};

export type AccountUpdateResult = AccountUpdateSuccess | InvalidInputErrors;

export type AccountUpdateSuccess = {
  __typename?: 'AccountUpdateSuccess';
  user: User;
};

export type EmailAlreadyTakenError = Error & {
  __typename?: 'EmailAlreadyTakenError';
  message: Scalars['String']['output'];
};

export type Error = {
  message: Scalars['String']['output'];
};

export const ErrorCode = {
  AccessTokenExpired: 'ACCESS_TOKEN_EXPIRED',
  AuthenticationError: 'AUTHENTICATION_ERROR',
  BadUserInput: 'BAD_USER_INPUT',
  Forbidden: 'FORBIDDEN',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
  QueryTooComplex: 'QUERY_TOO_COMPLEX',
  RateLimited: 'RATE_LIMITED'
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];
export type ExpiredVerificationTokenError = Error & {
  __typename?: 'ExpiredVerificationTokenError';
  message: Scalars['String']['output'];
};

export type IncorrectOldPasswordError = Error & {
  __typename?: 'IncorrectOldPasswordError';
  message: Scalars['String']['output'];
};

export type IncorrectPasswordError = Error & {
  __typename?: 'IncorrectPasswordError';
  message: Scalars['String']['output'];
};

export type InvalidInputError = Error & {
  __typename?: 'InvalidInputError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type InvalidInputErrors = {
  __typename?: 'InvalidInputErrors';
  errors: Array<InvalidInputError>;
};

export type InvalidRefreshTokenError = Error & {
  __typename?: 'InvalidRefreshTokenError';
  message: Scalars['String']['output'];
};

export type InvalidVerificationTokenError = Error & {
  __typename?: 'InvalidVerificationTokenError';
  message: Scalars['String']['output'];
};

export type LoginFailedError = Error & {
  __typename?: 'LoginFailedError';
  message: Scalars['String']['output'];
};

export type LoginResult = InvalidInputErrors | LoginFailedError | LoginSuccess;

export type LoginSuccess = {
  __typename?: 'LoginSuccess';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** 未ログインのみ */
  accessTokenRefresh?: Maybe<AccessTokenRefreshResult>;
  /**
   * 紐づくリソースは全て削除される
   *
   * ログイン済のみ
   */
  accountDelete?: Maybe<AccountDeleteResult>;
  /** ログイン済のみ */
  accountEmailChange?: Maybe<AccountEmailChangeResult>;
  /** ログイン済のみ */
  accountPasswordChange?: Maybe<AccountPasswordChangeResult>;
  /** ログイン済のみ */
  accountUpdate?: Maybe<AccountUpdateResult>;
  login?: Maybe<LoginResult>;
  logout?: Maybe<Scalars['Void']['output']>;
  /** 未ログインのみ */
  signupComplete?: Maybe<SignupCompleteResult>;
  /** 未ログインのみ */
  signupRequest?: Maybe<SignupRequestResult>;
  /**
   * 10000件まで
   *
   * ログイン済のみ
   */
  todoCreate?: Maybe<TodoCreateResult>;
  /** ログイン済のみ */
  todoDelete?: Maybe<TodoDeleteResult>;
  /** ログイン済のみ */
  todoStatusChange?: Maybe<TodoStatusChangeResult>;
  /** ログイン済のみ */
  todoUpdate?: Maybe<TodoUpdateResult>;
};


export type MutationAccessTokenRefreshArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationAccountDeleteArgs = {
  password: Scalars['String']['input'];
};


export type MutationAccountEmailChangeArgs = {
  email: Scalars['String']['input'];
};


export type MutationAccountPasswordChangeArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationAccountUpdateArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationLogoutArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationSignupCompleteArgs = {
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationSignupRequestArgs = {
  email: Scalars['String']['input'];
};


export type MutationTodoCreateArgs = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationTodoDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTodoStatusChangeArgs = {
  id: Scalars['ID']['input'];
  status: TodoStatus;
};


export type MutationTodoUpdateArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status?: InputMaybe<TodoStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type NewPasswordSameAsOldError = Error & {
  __typename?: 'NewPasswordSameAsOldError';
  message: Scalars['String']['output'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  /** ログイン済のみ */
  node?: Maybe<Node>;
  viewer?: Maybe<User>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};

export type RefreshTokenExpiredError = Error & {
  __typename?: 'RefreshTokenExpiredError';
  message: Scalars['String']['output'];
};

export type RefreshTokenReuseError = Error & {
  __typename?: 'RefreshTokenReuseError';
  message: Scalars['String']['output'];
};

export type ResourceLimitExceededError = Error & {
  __typename?: 'ResourceLimitExceededError';
  message: Scalars['String']['output'];
};

export type ResourceNotFoundError = Error & {
  __typename?: 'ResourceNotFoundError';
  message: Scalars['String']['output'];
};

export type SignupCompleteResult = EmailAlreadyTakenError | ExpiredVerificationTokenError | InvalidInputErrors | InvalidVerificationTokenError | SignupCompleteSuccess;

export type SignupCompleteSuccess = {
  __typename?: 'SignupCompleteSuccess';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type SignupRequestResult = InvalidInputErrors | SignupRequestSuccess;

export type SignupRequestSuccess = {
  __typename?: 'SignupRequestSuccess';
  message: Scalars['String']['output'];
};

export type Todo = Node & {
  __typename?: 'Todo';
  /** 所有者のみ */
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  /** 所有者のみ */
  description?: Maybe<Scalars['String']['output']>;
  /** 所有者のみ */
  id: Scalars['ID']['output'];
  /** 所有者のみ */
  status?: Maybe<TodoStatus>;
  /** 所有者のみ */
  title?: Maybe<Scalars['String']['output']>;
  /** 所有者のみ */
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  /** 所有者のみ */
  user?: Maybe<User>;
};

export type TodoConnection = {
  __typename?: 'TodoConnection';
  edges?: Maybe<Array<Maybe<TodoEdge>>>;
  nodes?: Maybe<Array<Maybe<Todo>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TodoCreateResult = InvalidInputErrors | ResourceLimitExceededError | TodoCreateSuccess;

export type TodoCreateSuccess = {
  __typename?: 'TodoCreateSuccess';
  todo: Todo;
  todoEdge: TodoEdge;
};

export type TodoDeleteResult = ResourceNotFoundError | TodoDeleteSuccess;

export type TodoDeleteSuccess = {
  __typename?: 'TodoDeleteSuccess';
  id: Scalars['ID']['output'];
};

export type TodoEdge = {
  __typename?: 'TodoEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Todo>;
};

export const TodoSortKeys = {
  CreatedAt: 'CREATED_AT',
  UpdatedAt: 'UPDATED_AT'
} as const;

export type TodoSortKeys = typeof TodoSortKeys[keyof typeof TodoSortKeys];
export const TodoStatus = {
  Done: 'DONE',
  Pending: 'PENDING'
} as const;

export type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus];
export type TodoStatusChangeResult = ResourceNotFoundError | TodoStatusChangeSuccess;

export type TodoStatusChangeSuccess = {
  __typename?: 'TodoStatusChangeSuccess';
  todo: Todo;
};

export type TodoUpdateResult = InvalidInputErrors | ResourceNotFoundError | TodoUpdateSuccess;

export type TodoUpdateSuccess = {
  __typename?: 'TodoUpdateSuccess';
  todo: Todo;
};

export type User = Node & {
  __typename?: 'User';
  /** 本人のみ */
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  /** 本人のみ */
  email?: Maybe<Scalars['EmailAddress']['output']>;
  /** 本人のみ */
  id: Scalars['ID']['output'];
  /** 本人のみ */
  name?: Maybe<Scalars['String']['output']>;
  /** 本人のみ */
  todo?: Maybe<Todo>;
  /** 本人のみ */
  todos?: Maybe<TodoConnection>;
  /** 本人のみ */
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};


export type UserTodoArgs = {
  id: Scalars['ID']['input'];
};


export type UserTodosArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortKey: TodoSortKeys;
  status?: InputMaybe<TodoStatus>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = T;

export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info?: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info?: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  AccessTokenRefreshResult:
    | ( AccessTokenRefreshSuccess & { __typename: 'AccessTokenRefreshSuccess' } )
    | ( InvalidRefreshTokenError & { __typename: 'InvalidRefreshTokenError' } )
    | ( RefreshTokenExpiredError & { __typename: 'RefreshTokenExpiredError' } )
    | ( RefreshTokenReuseError & { __typename: 'RefreshTokenReuseError' } )
  ;
  AccountDeleteResult:
    | ( AccountDeleteSuccess & { __typename: 'AccountDeleteSuccess' } )
    | ( IncorrectPasswordError & { __typename: 'IncorrectPasswordError' } )
    | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } )
  ;
  AccountEmailChangeResult:
    | ( Omit<AccountEmailChangeSuccess, 'user'> & { user: _RefType['User'] } & { __typename: 'AccountEmailChangeSuccess' } )
    | ( EmailAlreadyTakenError & { __typename: 'EmailAlreadyTakenError' } )
    | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } )
  ;
  AccountPasswordChangeResult:
    | ( Omit<AccountPasswordChangeSuccess, 'user'> & { user: _RefType['User'] } & { __typename: 'AccountPasswordChangeSuccess' } )
    | ( IncorrectOldPasswordError & { __typename: 'IncorrectOldPasswordError' } )
    | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } )
    | ( NewPasswordSameAsOldError & { __typename: 'NewPasswordSameAsOldError' } )
  ;
  AccountUpdateResult:
    | ( Omit<AccountUpdateSuccess, 'user'> & { user: _RefType['User'] } & { __typename: 'AccountUpdateSuccess' } )
    | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } )
  ;
  LoginResult:
    | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } )
    | ( LoginFailedError & { __typename: 'LoginFailedError' } )
    | ( LoginSuccess & { __typename: 'LoginSuccess' } )
  ;
  SignupCompleteResult:
    | ( EmailAlreadyTakenError & { __typename: 'EmailAlreadyTakenError' } )
    | ( ExpiredVerificationTokenError & { __typename: 'ExpiredVerificationTokenError' } )
    | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } )
    | ( InvalidVerificationTokenError & { __typename: 'InvalidVerificationTokenError' } )
    | ( SignupCompleteSuccess & { __typename: 'SignupCompleteSuccess' } )
  ;
  SignupRequestResult:
    | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } )
    | ( SignupRequestSuccess & { __typename: 'SignupRequestSuccess' } )
  ;
  TodoCreateResult:
    | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } )
    | ( ResourceLimitExceededError & { __typename: 'ResourceLimitExceededError' } )
    | ( Omit<TodoCreateSuccess, 'todo' | 'todoEdge'> & { todo: _RefType['Todo'], todoEdge: _RefType['TodoEdge'] } & { __typename: 'TodoCreateSuccess' } )
  ;
  TodoDeleteResult:
    | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } )
    | ( TodoDeleteSuccess & { __typename: 'TodoDeleteSuccess' } )
  ;
  TodoStatusChangeResult:
    | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } )
    | ( Omit<TodoStatusChangeSuccess, 'todo'> & { todo: _RefType['Todo'] } & { __typename: 'TodoStatusChangeSuccess' } )
  ;
  TodoUpdateResult:
    | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } )
    | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } )
    | ( Omit<TodoUpdateSuccess, 'todo'> & { todo: _RefType['Todo'] } & { __typename: 'TodoUpdateSuccess' } )
  ;
}>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Error:
    | ( EmailAlreadyTakenError )
    | ( ExpiredVerificationTokenError )
    | ( IncorrectOldPasswordError )
    | ( IncorrectPasswordError )
    | ( InvalidInputError )
    | ( InvalidRefreshTokenError )
    | ( InvalidVerificationTokenError )
    | ( LoginFailedError )
    | ( NewPasswordSameAsOldError )
    | ( RefreshTokenExpiredError )
    | ( RefreshTokenReuseError )
    | ( ResourceLimitExceededError )
    | ( ResourceNotFoundError )
  ;
  Node:
    | ( TodoMapper )
    | ( UserMapper )
  ;
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AccessTokenRefreshResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['AccessTokenRefreshResult']>;
  AccessTokenRefreshSuccess: ResolverTypeWrapper<AccessTokenRefreshSuccess>;
  AccountDeleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['AccountDeleteResult']>;
  AccountDeleteSuccess: ResolverTypeWrapper<AccountDeleteSuccess>;
  AccountEmailChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['AccountEmailChangeResult']>;
  AccountEmailChangeSuccess: ResolverTypeWrapper<Omit<AccountEmailChangeSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  AccountPasswordChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['AccountPasswordChangeResult']>;
  AccountPasswordChangeSuccess: ResolverTypeWrapper<Omit<AccountPasswordChangeSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  AccountUpdateResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['AccountUpdateResult']>;
  AccountUpdateSuccess: ResolverTypeWrapper<Omit<AccountUpdateSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTimeISO: ResolverTypeWrapper<Scalars['DateTimeISO']['output']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  EmailAlreadyTakenError: ResolverTypeWrapper<EmailAlreadyTakenError>;
  Error: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Error']>;
  ErrorCode: ErrorCode;
  ExpiredVerificationTokenError: ResolverTypeWrapper<ExpiredVerificationTokenError>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  IncorrectOldPasswordError: ResolverTypeWrapper<IncorrectOldPasswordError>;
  IncorrectPasswordError: ResolverTypeWrapper<IncorrectPasswordError>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputError: ResolverTypeWrapper<InvalidInputError>;
  InvalidInputErrors: ResolverTypeWrapper<InvalidInputErrors>;
  InvalidRefreshTokenError: ResolverTypeWrapper<InvalidRefreshTokenError>;
  InvalidVerificationTokenError: ResolverTypeWrapper<InvalidVerificationTokenError>;
  LoginFailedError: ResolverTypeWrapper<LoginFailedError>;
  LoginResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LoginResult']>;
  LoginSuccess: ResolverTypeWrapper<LoginSuccess>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  NewPasswordSameAsOldError: ResolverTypeWrapper<NewPasswordSameAsOldError>;
  Node: ResolverTypeWrapper<NodeMapper>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RefreshTokenExpiredError: ResolverTypeWrapper<RefreshTokenExpiredError>;
  RefreshTokenReuseError: ResolverTypeWrapper<RefreshTokenReuseError>;
  ResourceLimitExceededError: ResolverTypeWrapper<ResourceLimitExceededError>;
  ResourceNotFoundError: ResolverTypeWrapper<ResourceNotFoundError>;
  SignupCompleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['SignupCompleteResult']>;
  SignupCompleteSuccess: ResolverTypeWrapper<SignupCompleteSuccess>;
  SignupRequestResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['SignupRequestResult']>;
  SignupRequestSuccess: ResolverTypeWrapper<SignupRequestSuccess>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Todo: ResolverTypeWrapper<TodoMapper>;
  TodoConnection: ResolverTypeWrapper<Omit<TodoConnection, 'edges' | 'nodes'> & { edges?: Maybe<Array<Maybe<ResolversTypes['TodoEdge']>>>, nodes?: Maybe<Array<Maybe<ResolversTypes['Todo']>>> }>;
  TodoCreateResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoCreateResult']>;
  TodoCreateSuccess: ResolverTypeWrapper<Omit<TodoCreateSuccess, 'todo' | 'todoEdge'> & { todo: ResolversTypes['Todo'], todoEdge: ResolversTypes['TodoEdge'] }>;
  TodoDeleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoDeleteResult']>;
  TodoDeleteSuccess: ResolverTypeWrapper<TodoDeleteSuccess>;
  TodoEdge: ResolverTypeWrapper<Omit<TodoEdge, 'node'> & { node?: Maybe<ResolversTypes['Todo']> }>;
  TodoSortKeys: TodoSortKeys;
  TodoStatus: TodoStatus;
  TodoStatusChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoStatusChangeResult']>;
  TodoStatusChangeSuccess: ResolverTypeWrapper<Omit<TodoStatusChangeSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  TodoUpdateResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoUpdateResult']>;
  TodoUpdateSuccess: ResolverTypeWrapper<Omit<TodoUpdateSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  User: ResolverTypeWrapper<UserMapper>;
  Void: ResolverTypeWrapper<Scalars['Void']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AccessTokenRefreshResult: ResolversUnionTypes<ResolversParentTypes>['AccessTokenRefreshResult'];
  AccessTokenRefreshSuccess: AccessTokenRefreshSuccess;
  AccountDeleteResult: ResolversUnionTypes<ResolversParentTypes>['AccountDeleteResult'];
  AccountDeleteSuccess: AccountDeleteSuccess;
  AccountEmailChangeResult: ResolversUnionTypes<ResolversParentTypes>['AccountEmailChangeResult'];
  AccountEmailChangeSuccess: Omit<AccountEmailChangeSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  AccountPasswordChangeResult: ResolversUnionTypes<ResolversParentTypes>['AccountPasswordChangeResult'];
  AccountPasswordChangeSuccess: Omit<AccountPasswordChangeSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  AccountUpdateResult: ResolversUnionTypes<ResolversParentTypes>['AccountUpdateResult'];
  AccountUpdateSuccess: Omit<AccountUpdateSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  Boolean: Scalars['Boolean']['output'];
  DateTimeISO: Scalars['DateTimeISO']['output'];
  EmailAddress: Scalars['EmailAddress']['output'];
  EmailAlreadyTakenError: EmailAlreadyTakenError;
  Error: ResolversInterfaceTypes<ResolversParentTypes>['Error'];
  ExpiredVerificationTokenError: ExpiredVerificationTokenError;
  ID: Scalars['ID']['output'];
  IncorrectOldPasswordError: IncorrectOldPasswordError;
  IncorrectPasswordError: IncorrectPasswordError;
  Int: Scalars['Int']['output'];
  InvalidInputError: InvalidInputError;
  InvalidInputErrors: InvalidInputErrors;
  InvalidRefreshTokenError: InvalidRefreshTokenError;
  InvalidVerificationTokenError: InvalidVerificationTokenError;
  LoginFailedError: LoginFailedError;
  LoginResult: ResolversUnionTypes<ResolversParentTypes>['LoginResult'];
  LoginSuccess: LoginSuccess;
  Mutation: Record<PropertyKey, never>;
  NewPasswordSameAsOldError: NewPasswordSameAsOldError;
  Node: NodeMapper;
  PageInfo: PageInfo;
  Query: Record<PropertyKey, never>;
  RefreshTokenExpiredError: RefreshTokenExpiredError;
  RefreshTokenReuseError: RefreshTokenReuseError;
  ResourceLimitExceededError: ResourceLimitExceededError;
  ResourceNotFoundError: ResourceNotFoundError;
  SignupCompleteResult: ResolversUnionTypes<ResolversParentTypes>['SignupCompleteResult'];
  SignupCompleteSuccess: SignupCompleteSuccess;
  SignupRequestResult: ResolversUnionTypes<ResolversParentTypes>['SignupRequestResult'];
  SignupRequestSuccess: SignupRequestSuccess;
  String: Scalars['String']['output'];
  Todo: TodoMapper;
  TodoConnection: Omit<TodoConnection, 'edges' | 'nodes'> & { edges?: Maybe<Array<Maybe<ResolversParentTypes['TodoEdge']>>>, nodes?: Maybe<Array<Maybe<ResolversParentTypes['Todo']>>> };
  TodoCreateResult: ResolversUnionTypes<ResolversParentTypes>['TodoCreateResult'];
  TodoCreateSuccess: Omit<TodoCreateSuccess, 'todo' | 'todoEdge'> & { todo: ResolversParentTypes['Todo'], todoEdge: ResolversParentTypes['TodoEdge'] };
  TodoDeleteResult: ResolversUnionTypes<ResolversParentTypes>['TodoDeleteResult'];
  TodoDeleteSuccess: TodoDeleteSuccess;
  TodoEdge: Omit<TodoEdge, 'node'> & { node?: Maybe<ResolversParentTypes['Todo']> };
  TodoStatusChangeResult: ResolversUnionTypes<ResolversParentTypes>['TodoStatusChangeResult'];
  TodoStatusChangeSuccess: Omit<TodoStatusChangeSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  TodoUpdateResult: ResolversUnionTypes<ResolversParentTypes>['TodoUpdateResult'];
  TodoUpdateSuccess: Omit<TodoUpdateSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  User: UserMapper;
  Void: Scalars['Void']['output'];
}>;

export type ComplexityDirectiveArgs = {
  multipliers?: Maybe<Array<Scalars['String']['input']>>;
  perInstance: Scalars['Boolean']['input'];
  value: Scalars['Int']['input'];
};

export type ComplexityDirectiveResolver<Result, Parent, ContextType = Context, Args = ComplexityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type SemanticNonNullDirectiveArgs = {
  levels?: Maybe<Array<Maybe<Scalars['Int']['input']>>>;
};

export type SemanticNonNullDirectiveResolver<Result, Parent, ContextType = Context, Args = SemanticNonNullDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AccessTokenRefreshResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccessTokenRefreshResult'] = ResolversParentTypes['AccessTokenRefreshResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccessTokenRefreshSuccess' | 'InvalidRefreshTokenError' | 'RefreshTokenExpiredError' | 'RefreshTokenReuseError', ParentType, ContextType>;
}>;

export type AccessTokenRefreshSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccessTokenRefreshSuccess'] = ResolversParentTypes['AccessTokenRefreshSuccess']> = ResolversObject<{
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AccountDeleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountDeleteResult'] = ResolversParentTypes['AccountDeleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccountDeleteSuccess' | 'IncorrectPasswordError' | 'InvalidInputErrors', ParentType, ContextType>;
}>;

export type AccountDeleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountDeleteSuccess'] = ResolversParentTypes['AccountDeleteSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AccountEmailChangeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountEmailChangeResult'] = ResolversParentTypes['AccountEmailChangeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccountEmailChangeSuccess' | 'EmailAlreadyTakenError' | 'InvalidInputErrors', ParentType, ContextType>;
}>;

export type AccountEmailChangeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountEmailChangeSuccess'] = ResolversParentTypes['AccountEmailChangeSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AccountPasswordChangeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountPasswordChangeResult'] = ResolversParentTypes['AccountPasswordChangeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccountPasswordChangeSuccess' | 'IncorrectOldPasswordError' | 'InvalidInputErrors' | 'NewPasswordSameAsOldError', ParentType, ContextType>;
}>;

export type AccountPasswordChangeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountPasswordChangeSuccess'] = ResolversParentTypes['AccountPasswordChangeSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AccountUpdateResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountUpdateResult'] = ResolversParentTypes['AccountUpdateResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccountUpdateSuccess' | 'InvalidInputErrors', ParentType, ContextType>;
}>;

export type AccountUpdateSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountUpdateSuccess'] = ResolversParentTypes['AccountUpdateSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeIsoScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTimeISO'], any> {
  name: 'DateTimeISO';
}

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type EmailAlreadyTakenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EmailAlreadyTakenError'] = ResolversParentTypes['EmailAlreadyTakenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'ExpiredVerificationTokenError' | 'IncorrectOldPasswordError' | 'IncorrectPasswordError' | 'InvalidInputError' | 'InvalidRefreshTokenError' | 'InvalidVerificationTokenError' | 'LoginFailedError' | 'NewPasswordSameAsOldError' | 'RefreshTokenExpiredError' | 'RefreshTokenReuseError' | 'ResourceLimitExceededError' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type ExpiredVerificationTokenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExpiredVerificationTokenError'] = ResolversParentTypes['ExpiredVerificationTokenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IncorrectOldPasswordErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IncorrectOldPasswordError'] = ResolversParentTypes['IncorrectOldPasswordError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IncorrectPasswordErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IncorrectPasswordError'] = ResolversParentTypes['IncorrectPasswordError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InvalidInputErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvalidInputError'] = ResolversParentTypes['InvalidInputError']> = ResolversObject<{
  field?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InvalidInputErrorsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvalidInputErrors'] = ResolversParentTypes['InvalidInputErrors']> = ResolversObject<{
  errors?: Resolver<Array<ResolversTypes['InvalidInputError']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InvalidRefreshTokenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvalidRefreshTokenError'] = ResolversParentTypes['InvalidRefreshTokenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InvalidVerificationTokenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvalidVerificationTokenError'] = ResolversParentTypes['InvalidVerificationTokenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginFailedErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginFailedError'] = ResolversParentTypes['LoginFailedError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginResult'] = ResolversParentTypes['LoginResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputErrors' | 'LoginFailedError' | 'LoginSuccess', ParentType, ContextType>;
}>;

export type LoginSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginSuccess'] = ResolversParentTypes['LoginSuccess']> = ResolversObject<{
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  accessTokenRefresh: Resolver<Maybe<ResolversTypes['AccessTokenRefreshResult']>, ParentType, ContextType, RequireFields<MutationAccessTokenRefreshArgs, 'refreshToken'>>;
  accountDelete: Resolver<Maybe<ResolversTypes['AccountDeleteResult']>, ParentType, ContextType, RequireFields<MutationAccountDeleteArgs, 'password'>>;
  accountEmailChange: Resolver<Maybe<ResolversTypes['AccountEmailChangeResult']>, ParentType, ContextType, RequireFields<MutationAccountEmailChangeArgs, 'email'>>;
  accountPasswordChange: Resolver<Maybe<ResolversTypes['AccountPasswordChangeResult']>, ParentType, ContextType, RequireFields<MutationAccountPasswordChangeArgs, 'newPassword' | 'oldPassword'>>;
  accountUpdate: Resolver<Maybe<ResolversTypes['AccountUpdateResult']>, ParentType, ContextType, Partial<MutationAccountUpdateArgs>>;
  login: Resolver<Maybe<ResolversTypes['LoginResult']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  logout: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationLogoutArgs, 'refreshToken'>>;
  signupComplete: Resolver<Maybe<ResolversTypes['SignupCompleteResult']>, ParentType, ContextType, RequireFields<MutationSignupCompleteArgs, 'name' | 'password' | 'token'>>;
  signupRequest: Resolver<Maybe<ResolversTypes['SignupRequestResult']>, ParentType, ContextType, RequireFields<MutationSignupRequestArgs, 'email'>>;
  todoCreate: Resolver<Maybe<ResolversTypes['TodoCreateResult']>, ParentType, ContextType, RequireFields<MutationTodoCreateArgs, 'description' | 'title'>>;
  todoDelete: Resolver<Maybe<ResolversTypes['TodoDeleteResult']>, ParentType, ContextType, RequireFields<MutationTodoDeleteArgs, 'id'>>;
  todoStatusChange: Resolver<Maybe<ResolversTypes['TodoStatusChangeResult']>, ParentType, ContextType, RequireFields<MutationTodoStatusChangeArgs, 'id' | 'status'>>;
  todoUpdate: Resolver<Maybe<ResolversTypes['TodoUpdateResult']>, ParentType, ContextType, RequireFields<MutationTodoUpdateArgs, 'id'>>;
}>;

export type NewPasswordSameAsOldErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NewPasswordSameAsOldError'] = ResolversParentTypes['NewPasswordSameAsOldError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Todo' | 'User', ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  node: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  viewer: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type RefreshTokenExpiredErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RefreshTokenExpiredError'] = ResolversParentTypes['RefreshTokenExpiredError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RefreshTokenReuseErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RefreshTokenReuseError'] = ResolversParentTypes['RefreshTokenReuseError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ResourceLimitExceededErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ResourceLimitExceededError'] = ResolversParentTypes['ResourceLimitExceededError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ResourceNotFoundErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ResourceNotFoundError'] = ResolversParentTypes['ResourceNotFoundError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SignupCompleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupCompleteResult'] = ResolversParentTypes['SignupCompleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'ExpiredVerificationTokenError' | 'InvalidInputErrors' | 'InvalidVerificationTokenError' | 'SignupCompleteSuccess', ParentType, ContextType>;
}>;

export type SignupCompleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupCompleteSuccess'] = ResolversParentTypes['SignupCompleteSuccess']> = ResolversObject<{
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SignupRequestResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupRequestResult'] = ResolversParentTypes['SignupRequestResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputErrors' | 'SignupRequestSuccess', ParentType, ContextType>;
}>;

export type SignupRequestSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupRequestSuccess'] = ResolversParentTypes['SignupRequestSuccess']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Todo'] = ResolversParentTypes['Todo']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TodoStatus']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoConnection'] = ResolversParentTypes['TodoConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['TodoEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Todo']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type TodoCreateResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoCreateResult'] = ResolversParentTypes['TodoCreateResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputErrors' | 'ResourceLimitExceededError' | 'TodoCreateSuccess', ParentType, ContextType>;
}>;

export type TodoCreateSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoCreateSuccess'] = ResolversParentTypes['TodoCreateSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  todoEdge?: Resolver<ResolversTypes['TodoEdge'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoDeleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoDeleteResult'] = ResolversParentTypes['TodoDeleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ResourceNotFoundError' | 'TodoDeleteSuccess', ParentType, ContextType>;
}>;

export type TodoDeleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoDeleteSuccess'] = ResolversParentTypes['TodoDeleteSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoEdge'] = ResolversParentTypes['TodoEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType>;
}>;

export type TodoStatusChangeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoStatusChangeResult'] = ResolversParentTypes['TodoStatusChangeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ResourceNotFoundError' | 'TodoStatusChangeSuccess', ParentType, ContextType>;
}>;

export type TodoStatusChangeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoStatusChangeSuccess'] = ResolversParentTypes['TodoStatusChangeSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoUpdateResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoUpdateResult'] = ResolversParentTypes['TodoUpdateResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputErrors' | 'ResourceNotFoundError' | 'TodoUpdateSuccess', ParentType, ContextType>;
}>;

export type TodoUpdateSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoUpdateSuccess'] = ResolversParentTypes['TodoUpdateSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['EmailAddress']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  todo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType, RequireFields<UserTodoArgs, 'id'>>;
  todos?: Resolver<Maybe<ResolversTypes['TodoConnection']>, ParentType, ContextType, RequireFields<UserTodosArgs, 'reverse' | 'sortKey'>>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTimeISO']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type Resolvers<ContextType = Context> = ResolversObject<{
  AccessTokenRefreshResult?: AccessTokenRefreshResultResolvers<ContextType>;
  AccessTokenRefreshSuccess?: AccessTokenRefreshSuccessResolvers<ContextType>;
  AccountDeleteResult?: AccountDeleteResultResolvers<ContextType>;
  AccountDeleteSuccess?: AccountDeleteSuccessResolvers<ContextType>;
  AccountEmailChangeResult?: AccountEmailChangeResultResolvers<ContextType>;
  AccountEmailChangeSuccess?: AccountEmailChangeSuccessResolvers<ContextType>;
  AccountPasswordChangeResult?: AccountPasswordChangeResultResolvers<ContextType>;
  AccountPasswordChangeSuccess?: AccountPasswordChangeSuccessResolvers<ContextType>;
  AccountUpdateResult?: AccountUpdateResultResolvers<ContextType>;
  AccountUpdateSuccess?: AccountUpdateSuccessResolvers<ContextType>;
  DateTimeISO?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  EmailAlreadyTakenError?: EmailAlreadyTakenErrorResolvers<ContextType>;
  Error?: ErrorResolvers<ContextType>;
  ExpiredVerificationTokenError?: ExpiredVerificationTokenErrorResolvers<ContextType>;
  IncorrectOldPasswordError?: IncorrectOldPasswordErrorResolvers<ContextType>;
  IncorrectPasswordError?: IncorrectPasswordErrorResolvers<ContextType>;
  InvalidInputError?: InvalidInputErrorResolvers<ContextType>;
  InvalidInputErrors?: InvalidInputErrorsResolvers<ContextType>;
  InvalidRefreshTokenError?: InvalidRefreshTokenErrorResolvers<ContextType>;
  InvalidVerificationTokenError?: InvalidVerificationTokenErrorResolvers<ContextType>;
  LoginFailedError?: LoginFailedErrorResolvers<ContextType>;
  LoginResult?: LoginResultResolvers<ContextType>;
  LoginSuccess?: LoginSuccessResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NewPasswordSameAsOldError?: NewPasswordSameAsOldErrorResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RefreshTokenExpiredError?: RefreshTokenExpiredErrorResolvers<ContextType>;
  RefreshTokenReuseError?: RefreshTokenReuseErrorResolvers<ContextType>;
  ResourceLimitExceededError?: ResourceLimitExceededErrorResolvers<ContextType>;
  ResourceNotFoundError?: ResourceNotFoundErrorResolvers<ContextType>;
  SignupCompleteResult?: SignupCompleteResultResolvers<ContextType>;
  SignupCompleteSuccess?: SignupCompleteSuccessResolvers<ContextType>;
  SignupRequestResult?: SignupRequestResultResolvers<ContextType>;
  SignupRequestSuccess?: SignupRequestSuccessResolvers<ContextType>;
  Todo?: TodoResolvers<ContextType>;
  TodoConnection?: TodoConnectionResolvers<ContextType>;
  TodoCreateResult?: TodoCreateResultResolvers<ContextType>;
  TodoCreateSuccess?: TodoCreateSuccessResolvers<ContextType>;
  TodoDeleteResult?: TodoDeleteResultResolvers<ContextType>;
  TodoDeleteSuccess?: TodoDeleteSuccessResolvers<ContextType>;
  TodoEdge?: TodoEdgeResolvers<ContextType>;
  TodoStatusChangeResult?: TodoStatusChangeResultResolvers<ContextType>;
  TodoStatusChangeSuccess?: TodoStatusChangeSuccessResolvers<ContextType>;
  TodoUpdateResult?: TodoUpdateResultResolvers<ContextType>;
  TodoUpdateSuccess?: TodoUpdateSuccessResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Void?: GraphQLScalarType;
}>;

export type DirectiveResolvers<ContextType = Context> = ResolversObject<{
  complexity?: ComplexityDirectiveResolver<any, any, ContextType>;
  semanticNonNull?: SemanticNonNullDirectiveResolver<any, any, ContextType>;
}>;
