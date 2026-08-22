/* eslint-disable */
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: string; output: string; }
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  EmailAddress: { input: string; output: string; }
  /** Represents NULL values */
  Void: { input: void; output: void; }
};

export type AccessTokenRefreshResult = AccessTokenRefreshSuccess | InvalidRefreshTokenError | RefreshTokenExpiredError | RefreshTokenReuseError;

export type AccessTokenRefreshSuccess = {
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type AccountDeleteResult = AccountDeleteSuccess | IncorrectPasswordError | InvalidInputErrors;

export type AccountDeleteSuccess = {
  id: Scalars['ID']['output'];
};

export type AccountEmailChangeResult = AccountEmailChangeSuccess | EmailAlreadyTakenError | InvalidInputErrors;

export type AccountEmailChangeSuccess = {
  user: User;
};

export type AccountPasswordChangeResult = AccountPasswordChangeSuccess | IncorrectOldPasswordError | InvalidInputErrors | NewPasswordSameAsOldError;

export type AccountPasswordChangeSuccess = {
  user: User;
};

export type AccountUpdateResult = AccountUpdateSuccess | InvalidInputErrors;

export type AccountUpdateSuccess = {
  user: User;
};

export type EmailAlreadyTakenError = Error & {
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
  message: Scalars['String']['output'];
};

export type IncorrectOldPasswordError = Error & {
  message: Scalars['String']['output'];
};

export type IncorrectPasswordError = Error & {
  message: Scalars['String']['output'];
};

export type InvalidInputError = Error & {
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type InvalidInputErrors = {
  errors: Array<InvalidInputError>;
};

export type InvalidRefreshTokenError = Error & {
  message: Scalars['String']['output'];
};

export type InvalidVerificationTokenError = Error & {
  message: Scalars['String']['output'];
};

export type LoginFailedError = Error & {
  message: Scalars['String']['output'];
};

export type LoginResult = InvalidInputErrors | LoginFailedError | LoginSuccess;

export type LoginSuccess = {
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type Mutation = {
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
  description?: Scalars['String']['input'];
  title?: Scalars['String']['input'];
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
  message: Scalars['String']['output'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type PageInfo = {
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  /** ログイン済のみ */
  node?: Maybe<Node>;
  viewer?: Maybe<User>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};

export type RefreshTokenExpiredError = Error & {
  message: Scalars['String']['output'];
};

export type RefreshTokenReuseError = Error & {
  message: Scalars['String']['output'];
};

export type ResourceLimitExceededError = Error & {
  message: Scalars['String']['output'];
};

export type ResourceNotFoundError = Error & {
  message: Scalars['String']['output'];
};

export type SignupCompleteResult = EmailAlreadyTakenError | ExpiredVerificationTokenError | InvalidInputErrors | InvalidVerificationTokenError | SignupCompleteSuccess;

export type SignupCompleteSuccess = {
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type SignupRequestResult = InvalidInputErrors | SignupRequestSuccess;

export type SignupRequestSuccess = {
  message: Scalars['String']['output'];
};

export type Todo = Node & {
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
  edges?: Maybe<Array<Maybe<TodoEdge>>>;
  nodes?: Maybe<Array<Maybe<Todo>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TodoCreateResult = InvalidInputErrors | ResourceLimitExceededError | TodoCreateSuccess;

export type TodoCreateSuccess = {
  todo: Todo;
  todoEdge: TodoEdge;
};

export type TodoDeleteResult = ResourceNotFoundError | TodoDeleteSuccess;

export type TodoDeleteSuccess = {
  id: Scalars['ID']['output'];
};

export type TodoEdge = {
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
  todo: Todo;
};

export type TodoUpdateResult = InvalidInputErrors | ResourceNotFoundError | TodoUpdateSuccess;

export type TodoUpdateSuccess = {
  todo: Todo;
};

export type User = Node & {
  /** 本人のみ */
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  /** 本人のみ */
  email?: Maybe<Scalars['EmailAddress']['output']>;
  /** 所有者のみ */
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
  reverse?: Scalars['Boolean']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortKey?: TodoSortKeys;
  status?: InputMaybe<TodoStatus>;
};

export type SharedSignupRequestMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type SharedSignupRequestMutation = { signupRequest?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'SignupRequestSuccess', message: string }
   | null };

export type SharedSignupCompleteMutationVariables = Exact<{
  token: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type SharedSignupCompleteMutation = { signupComplete?:
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'ExpiredVerificationTokenError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'InvalidVerificationTokenError' }
    | { __typename: 'SignupCompleteSuccess', accessToken: string, refreshToken: string }
   | null };

export type LogoutLoginAccountEmailChangeMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type LogoutLoginAccountEmailChangeMutation = { accountEmailChange?:
    | { __typename: 'AccountEmailChangeSuccess', user: { id: string } }
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'InvalidInputErrors' }
   | null };

export type LogoutLoginAccountPasswordChangeMutationVariables = Exact<{
  oldPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type LogoutLoginAccountPasswordChangeMutation = { accountPasswordChange?:
    | { __typename: 'AccountPasswordChangeSuccess', user: { id: string } }
    | { __typename: 'IncorrectOldPasswordError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'NewPasswordSameAsOldError' }
   | null };

export type LogoutLoginLogoutMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
}>;


export type LogoutLoginLogoutMutation = { logout?: void | null };

export type LogoutLoginLoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LogoutLoginLoginMutation = { login?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'LoginFailedError' }
    | { __typename: 'LoginSuccess', accessToken: string, refreshToken: string }
   | null };

export type LogoutLoginViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type LogoutLoginViewerQuery = { viewer?: { id: string, name?: string | null, email?: string | null, createdAt?: string | null, updatedAt?: string | null, todos?: { totalCount?: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } | null> | null } | null } | null };

export type MultiDeviceViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type MultiDeviceViewerQuery = { viewer?: { id: string, name?: string | null, email?: string | null, createdAt?: string | null, updatedAt?: string | null, todos?: { totalCount?: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } | null> | null } | null } | null };

export type MultiDeviceTodoCreateMutationVariables = Exact<{
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type MultiDeviceTodoCreateMutation = { todoCreate?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceLimitExceededError' }
    | { __typename: 'TodoCreateSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null } }
   | null };

export type MultiDeviceLoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type MultiDeviceLoginMutation = { login?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'LoginFailedError' }
    | { __typename: 'LoginSuccess', accessToken: string, refreshToken: string }
   | null };

export type MultiDeviceTodoUpdateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TodoStatus>;
}>;


export type MultiDeviceTodoUpdateMutation = { todoUpdate?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoUpdateSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } }
   | null };

export type MultiDeviceAccessTokenRefreshMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
}>;


export type MultiDeviceAccessTokenRefreshMutation = { accessTokenRefresh?:
    | { __typename: 'AccessTokenRefreshSuccess', accessToken: string }
    | { __typename: 'InvalidRefreshTokenError' }
    | { __typename: 'RefreshTokenExpiredError' }
    | { __typename: 'RefreshTokenReuseError' }
   | null };

export type MultiDeviceTodoDeleteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MultiDeviceTodoDeleteMutation = { todoDelete?:
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoDeleteSuccess', id: string }
   | null };

export type RateLimitViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type RateLimitViewerQuery = { viewer?: { __typename: 'User', id: string, name?: string | null, email?: string | null, createdAt?: string | null, updatedAt?: string | null, todos?: { totalCount?: number | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, nodes?: Array<{ id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } | null> | null } | null } | null };

export type RefreshTokenReuseAccessTokenRefreshMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
}>;


export type RefreshTokenReuseAccessTokenRefreshMutation = { accessTokenRefresh?:
    | { __typename: 'AccessTokenRefreshSuccess', accessToken: string, refreshToken: string }
    | { __typename: 'InvalidRefreshTokenError', message: string }
    | { __typename: 'RefreshTokenExpiredError' }
    | { __typename: 'RefreshTokenReuseError', message: string }
   | null };

export type SignupFlowSignupRequestMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type SignupFlowSignupRequestMutation = { signupRequest?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'SignupRequestSuccess', message: string }
   | null };

export type SignupFlowSignupCompleteMutationVariables = Exact<{
  token: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type SignupFlowSignupCompleteMutation = { signupComplete?:
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'ExpiredVerificationTokenError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'InvalidVerificationTokenError' }
    | { __typename: 'SignupCompleteSuccess', accessToken: string, refreshToken: string }
   | null };

export type SignupFlowViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type SignupFlowViewerQuery = { viewer?: { id: string, name?: string | null, email?: string | null } | null };

export type SingleDeviceViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type SingleDeviceViewerQuery = { viewer?: { id: string, name?: string | null, email?: string | null, createdAt?: string | null, updatedAt?: string | null, todos?: { totalCount?: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } | null> | null } | null } | null };

export type SingleDeviceTodoCreateMutationVariables = Exact<{
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type SingleDeviceTodoCreateMutation = { todoCreate?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceLimitExceededError' }
    | { __typename: 'TodoCreateSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null } }
   | null };

export type SingleDeviceTodoUpdateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TodoStatus>;
}>;


export type SingleDeviceTodoUpdateMutation = { todoUpdate?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoUpdateSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } }
   | null };

export type SingleDeviceAccessTokenRefreshMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
}>;


export type SingleDeviceAccessTokenRefreshMutation = { accessTokenRefresh?:
    | { __typename: 'AccessTokenRefreshSuccess', accessToken: string }
    | { __typename: 'InvalidRefreshTokenError' }
    | { __typename: 'RefreshTokenExpiredError' }
    | { __typename: 'RefreshTokenReuseError' }
   | null };

export type SingleDeviceTodoStatusChangeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: TodoStatus;
}>;


export type SingleDeviceTodoStatusChangeMutation = { todoStatusChange?:
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoStatusChangeSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } }
   | null };

export type SingleDeviceAccountDeleteMutationVariables = Exact<{
  password: Scalars['String']['input'];
}>;


export type SingleDeviceAccountDeleteMutation = { accountDelete?:
    | { __typename: 'AccountDeleteSuccess', id: string }
    | { __typename: 'IncorrectPasswordError' }
    | { __typename: 'InvalidInputErrors' }
   | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const SharedSignupRequestDocument = new TypedDocumentString(`
    mutation SharedSignupRequest($email: String!) {
  signupRequest(email: $email) {
    __typename
    ... on SignupRequestSuccess {
      message
    }
  }
}
    `) as unknown as TypedDocumentString<SharedSignupRequestMutation, SharedSignupRequestMutationVariables>;
export const SharedSignupCompleteDocument = new TypedDocumentString(`
    mutation SharedSignupComplete($token: String!, $name: String!, $password: String!) {
  signupComplete(token: $token, name: $name, password: $password) {
    __typename
    ... on SignupCompleteSuccess {
      accessToken
      refreshToken
    }
  }
}
    `) as unknown as TypedDocumentString<SharedSignupCompleteMutation, SharedSignupCompleteMutationVariables>;
export const LogoutLoginAccountEmailChangeDocument = new TypedDocumentString(`
    mutation LogoutLoginAccountEmailChange($email: String!) {
  accountEmailChange(email: $email) {
    __typename
    ... on AccountEmailChangeSuccess {
      user {
        id
      }
    }
  }
}
    `) as unknown as TypedDocumentString<LogoutLoginAccountEmailChangeMutation, LogoutLoginAccountEmailChangeMutationVariables>;
export const LogoutLoginAccountPasswordChangeDocument = new TypedDocumentString(`
    mutation LogoutLoginAccountPasswordChange($oldPassword: String!, $newPassword: String!) {
  accountPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {
    __typename
    ... on AccountPasswordChangeSuccess {
      user {
        id
      }
    }
  }
}
    `) as unknown as TypedDocumentString<LogoutLoginAccountPasswordChangeMutation, LogoutLoginAccountPasswordChangeMutationVariables>;
export const LogoutLoginLogoutDocument = new TypedDocumentString(`
    mutation LogoutLoginLogout($refreshToken: String!) {
  logout(refreshToken: $refreshToken)
}
    `) as unknown as TypedDocumentString<LogoutLoginLogoutMutation, LogoutLoginLogoutMutationVariables>;
export const LogoutLoginLoginDocument = new TypedDocumentString(`
    mutation LogoutLoginLogin($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    __typename
    ... on LoginSuccess {
      accessToken
      refreshToken
    }
  }
}
    `) as unknown as TypedDocumentString<LogoutLoginLoginMutation, LogoutLoginLoginMutationVariables>;
export const LogoutLoginViewerDocument = new TypedDocumentString(`
    query LogoutLoginViewer {
  viewer {
    id
    name
    email
    createdAt
    updatedAt
    todos(first: 10) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<LogoutLoginViewerQuery, LogoutLoginViewerQueryVariables>;
export const MultiDeviceViewerDocument = new TypedDocumentString(`
    query MultiDeviceViewer {
  viewer {
    id
    name
    email
    createdAt
    updatedAt
    todos(first: 10) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceViewerQuery, MultiDeviceViewerQueryVariables>;
export const MultiDeviceTodoCreateDocument = new TypedDocumentString(`
    mutation MultiDeviceTodoCreate($title: String, $description: String) {
  todoCreate(title: $title, description: $description) {
    __typename
    ... on TodoCreateSuccess {
      todo {
        id
        title
        description
        status
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceTodoCreateMutation, MultiDeviceTodoCreateMutationVariables>;
export const MultiDeviceLoginDocument = new TypedDocumentString(`
    mutation MultiDeviceLogin($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    __typename
    ... on LoginSuccess {
      accessToken
      refreshToken
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceLoginMutation, MultiDeviceLoginMutationVariables>;
export const MultiDeviceTodoUpdateDocument = new TypedDocumentString(`
    mutation MultiDeviceTodoUpdate($id: ID!, $title: String, $description: String, $status: TodoStatus) {
  todoUpdate(id: $id, title: $title, description: $description, status: $status) {
    __typename
    ... on TodoUpdateSuccess {
      todo {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceTodoUpdateMutation, MultiDeviceTodoUpdateMutationVariables>;
export const MultiDeviceAccessTokenRefreshDocument = new TypedDocumentString(`
    mutation MultiDeviceAccessTokenRefresh($refreshToken: String!) {
  accessTokenRefresh(refreshToken: $refreshToken) {
    __typename
    ... on AccessTokenRefreshSuccess {
      accessToken
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceAccessTokenRefreshMutation, MultiDeviceAccessTokenRefreshMutationVariables>;
export const MultiDeviceTodoDeleteDocument = new TypedDocumentString(`
    mutation MultiDeviceTodoDelete($id: ID!) {
  todoDelete(id: $id) {
    __typename
    ... on TodoDeleteSuccess {
      id
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceTodoDeleteMutation, MultiDeviceTodoDeleteMutationVariables>;
export const RateLimitViewerDocument = new TypedDocumentString(`
    query RateLimitViewer {
  viewer {
    __typename
    id
    name
    email
    createdAt
    updatedAt
    todos(first: 50) {
      totalCount
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      nodes {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<RateLimitViewerQuery, RateLimitViewerQueryVariables>;
export const RefreshTokenReuseAccessTokenRefreshDocument = new TypedDocumentString(`
    mutation RefreshTokenReuseAccessTokenRefresh($refreshToken: String!) {
  accessTokenRefresh(refreshToken: $refreshToken) {
    __typename
    ... on AccessTokenRefreshSuccess {
      accessToken
      refreshToken
    }
    ... on InvalidRefreshTokenError {
      message
    }
    ... on RefreshTokenReuseError {
      message
    }
  }
}
    `) as unknown as TypedDocumentString<RefreshTokenReuseAccessTokenRefreshMutation, RefreshTokenReuseAccessTokenRefreshMutationVariables>;
export const SignupFlowSignupRequestDocument = new TypedDocumentString(`
    mutation SignupFlowSignupRequest($email: String!) {
  signupRequest(email: $email) {
    __typename
    ... on SignupRequestSuccess {
      message
    }
  }
}
    `) as unknown as TypedDocumentString<SignupFlowSignupRequestMutation, SignupFlowSignupRequestMutationVariables>;
export const SignupFlowSignupCompleteDocument = new TypedDocumentString(`
    mutation SignupFlowSignupComplete($token: String!, $name: String!, $password: String!) {
  signupComplete(token: $token, name: $name, password: $password) {
    __typename
    ... on SignupCompleteSuccess {
      accessToken
      refreshToken
    }
  }
}
    `) as unknown as TypedDocumentString<SignupFlowSignupCompleteMutation, SignupFlowSignupCompleteMutationVariables>;
export const SignupFlowViewerDocument = new TypedDocumentString(`
    query SignupFlowViewer {
  viewer {
    id
    name
    email
  }
}
    `) as unknown as TypedDocumentString<SignupFlowViewerQuery, SignupFlowViewerQueryVariables>;
export const SingleDeviceViewerDocument = new TypedDocumentString(`
    query SingleDeviceViewer {
  viewer {
    id
    name
    email
    createdAt
    updatedAt
    todos(first: 10) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceViewerQuery, SingleDeviceViewerQueryVariables>;
export const SingleDeviceTodoCreateDocument = new TypedDocumentString(`
    mutation SingleDeviceTodoCreate($title: String, $description: String) {
  todoCreate(title: $title, description: $description) {
    __typename
    ... on TodoCreateSuccess {
      todo {
        id
        title
        description
        status
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceTodoCreateMutation, SingleDeviceTodoCreateMutationVariables>;
export const SingleDeviceTodoUpdateDocument = new TypedDocumentString(`
    mutation SingleDeviceTodoUpdate($id: ID!, $title: String, $description: String, $status: TodoStatus) {
  todoUpdate(id: $id, title: $title, description: $description, status: $status) {
    __typename
    ... on TodoUpdateSuccess {
      todo {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceTodoUpdateMutation, SingleDeviceTodoUpdateMutationVariables>;
export const SingleDeviceAccessTokenRefreshDocument = new TypedDocumentString(`
    mutation SingleDeviceAccessTokenRefresh($refreshToken: String!) {
  accessTokenRefresh(refreshToken: $refreshToken) {
    __typename
    ... on AccessTokenRefreshSuccess {
      accessToken
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceAccessTokenRefreshMutation, SingleDeviceAccessTokenRefreshMutationVariables>;
export const SingleDeviceTodoStatusChangeDocument = new TypedDocumentString(`
    mutation SingleDeviceTodoStatusChange($id: ID!, $status: TodoStatus!) {
  todoStatusChange(id: $id, status: $status) {
    __typename
    ... on TodoStatusChangeSuccess {
      todo {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceTodoStatusChangeMutation, SingleDeviceTodoStatusChangeMutationVariables>;
export const SingleDeviceAccountDeleteDocument = new TypedDocumentString(`
    mutation SingleDeviceAccountDelete($password: String!) {
  accountDelete(password: $password) {
    __typename
    ... on AccountDeleteSuccess {
      id
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceAccountDeleteMutation, SingleDeviceAccountDeleteMutationVariables>;