/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export const TodoStatus = {
  Done: 'DONE',
  Pending: 'PENDING'
} as const;

export type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus];
export type SharedSignupRequestMutationVariables = Exact<{
  email: string;
}>;


export type SharedSignupRequestMutation = { signupRequest:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'SignupRequestSuccess', message: string }
   | null };

export type SharedSignupCompleteMutationVariables = Exact<{
  token: string;
  name: string;
  password: string;
}>;


export type SharedSignupCompleteMutation = { signupComplete:
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'ExpiredVerificationTokenError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'InvalidVerificationTokenError' }
    | { __typename: 'SignupCompleteSuccess', accessToken: string, refreshToken: string }
   | null };

export type LogoutLoginAccountEmailChangeMutationVariables = Exact<{
  email: string;
}>;


export type LogoutLoginAccountEmailChangeMutation = { accountEmailChange:
    | { __typename: 'AccountEmailChangeSuccess', user: { id: string } }
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'InvalidInputErrors' }
   | null };

export type LogoutLoginAccountPasswordChangeMutationVariables = Exact<{
  oldPassword: string;
  newPassword: string;
}>;


export type LogoutLoginAccountPasswordChangeMutation = { accountPasswordChange:
    | { __typename: 'AccountPasswordChangeSuccess', user: { id: string } }
    | { __typename: 'IncorrectOldPasswordError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'NewPasswordSameAsOldError' }
   | null };

export type LogoutLoginLogoutMutationVariables = Exact<{
  refreshToken: string;
}>;


export type LogoutLoginLogoutMutation = { logout: void | null };

export type LogoutLoginLoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;


export type LogoutLoginLoginMutation = { login:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'LoginFailedError' }
    | { __typename: 'LoginSuccess', accessToken: string, refreshToken: string }
   | null };

export type LogoutLoginViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type LogoutLoginViewerQuery = { viewer: { id: string, name: string | null, email: string | null, createdAt: string | null, updatedAt: string | null, todos: { totalCount: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null }, nodes: Array<{ id: string, title: string | null, description: string | null, status: TodoStatus | null, createdAt: string | null, updatedAt: string | null } | null> | null } | null } | null };

export type MultiDeviceViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type MultiDeviceViewerQuery = { viewer: { id: string, name: string | null, email: string | null, createdAt: string | null, updatedAt: string | null, todos: { totalCount: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null }, nodes: Array<{ id: string, title: string | null, description: string | null, status: TodoStatus | null, createdAt: string | null, updatedAt: string | null } | null> | null } | null } | null };

export type MultiDeviceTodoCreateMutationVariables = Exact<{
  title?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type MultiDeviceTodoCreateMutation = { todoCreate:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceLimitExceededError' }
    | { __typename: 'TodoCreateSuccess', todo: { id: string, title: string | null, description: string | null, status: TodoStatus | null } }
   | null };

export type MultiDeviceLoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;


export type MultiDeviceLoginMutation = { login:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'LoginFailedError' }
    | { __typename: 'LoginSuccess', accessToken: string, refreshToken: string }
   | null };

export type MultiDeviceTodoUpdateMutationVariables = Exact<{
  id: string;
  title?: string | null | undefined;
  description?: string | null | undefined;
  status?: TodoStatus | null | undefined;
}>;


export type MultiDeviceTodoUpdateMutation = { todoUpdate:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoUpdateSuccess', todo: { id: string, title: string | null, description: string | null, status: TodoStatus | null, createdAt: string | null, updatedAt: string | null } }
   | null };

export type MultiDeviceAccessTokenRefreshMutationVariables = Exact<{
  refreshToken: string;
}>;


export type MultiDeviceAccessTokenRefreshMutation = { accessTokenRefresh:
    | { __typename: 'AccessTokenRefreshSuccess', accessToken: string }
    | { __typename: 'InvalidRefreshTokenError' }
    | { __typename: 'RefreshTokenExpiredError' }
    | { __typename: 'RefreshTokenReuseError' }
   | null };

export type MultiDeviceTodoDeleteMutationVariables = Exact<{
  id: string;
}>;


export type MultiDeviceTodoDeleteMutation = { todoDelete:
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoDeleteSuccess', id: string }
   | null };

export type RateLimitViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type RateLimitViewerQuery = { viewer: { __typename: 'User', id: string, name: string | null, email: string | null, createdAt: string | null, updatedAt: string | null, todos: { totalCount: number | null, pageInfo: { startCursor: string | null, endCursor: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, nodes: Array<{ id: string, title: string | null, description: string | null, status: TodoStatus | null, createdAt: string | null, updatedAt: string | null } | null> | null } | null } | null };

export type RefreshTokenReuseAccessTokenRefreshMutationVariables = Exact<{
  refreshToken: string;
}>;


export type RefreshTokenReuseAccessTokenRefreshMutation = { accessTokenRefresh:
    | { __typename: 'AccessTokenRefreshSuccess', accessToken: string, refreshToken: string }
    | { __typename: 'InvalidRefreshTokenError', message: string }
    | { __typename: 'RefreshTokenExpiredError' }
    | { __typename: 'RefreshTokenReuseError', message: string }
   | null };

export type SignupFlowSignupRequestMutationVariables = Exact<{
  email: string;
}>;


export type SignupFlowSignupRequestMutation = { signupRequest:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'SignupRequestSuccess', message: string }
   | null };

export type SignupFlowSignupCompleteMutationVariables = Exact<{
  token: string;
  name: string;
  password: string;
}>;


export type SignupFlowSignupCompleteMutation = { signupComplete:
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'ExpiredVerificationTokenError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'InvalidVerificationTokenError' }
    | { __typename: 'SignupCompleteSuccess', accessToken: string, refreshToken: string }
   | null };

export type SignupFlowViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type SignupFlowViewerQuery = { viewer: { id: string, name: string | null, email: string | null } | null };

export type SingleDeviceViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type SingleDeviceViewerQuery = { viewer: { id: string, name: string | null, email: string | null, createdAt: string | null, updatedAt: string | null, todos: { totalCount: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null }, nodes: Array<{ id: string, title: string | null, description: string | null, status: TodoStatus | null, createdAt: string | null, updatedAt: string | null } | null> | null } | null } | null };

export type SingleDeviceTodoCreateMutationVariables = Exact<{
  title?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type SingleDeviceTodoCreateMutation = { todoCreate:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceLimitExceededError' }
    | { __typename: 'TodoCreateSuccess', todo: { id: string, title: string | null, description: string | null, status: TodoStatus | null } }
   | null };

export type SingleDeviceTodoUpdateMutationVariables = Exact<{
  id: string;
  title?: string | null | undefined;
  description?: string | null | undefined;
  status?: TodoStatus | null | undefined;
}>;


export type SingleDeviceTodoUpdateMutation = { todoUpdate:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoUpdateSuccess', todo: { id: string, title: string | null, description: string | null, status: TodoStatus | null, createdAt: string | null, updatedAt: string | null } }
   | null };

export type SingleDeviceAccessTokenRefreshMutationVariables = Exact<{
  refreshToken: string;
}>;


export type SingleDeviceAccessTokenRefreshMutation = { accessTokenRefresh:
    | { __typename: 'AccessTokenRefreshSuccess', accessToken: string }
    | { __typename: 'InvalidRefreshTokenError' }
    | { __typename: 'RefreshTokenExpiredError' }
    | { __typename: 'RefreshTokenReuseError' }
   | null };

export type SingleDeviceTodoStatusChangeMutationVariables = Exact<{
  id: string;
  status: TodoStatus;
}>;


export type SingleDeviceTodoStatusChangeMutation = { todoStatusChange:
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoStatusChangeSuccess', todo: { id: string, title: string | null, description: string | null, status: TodoStatus | null, createdAt: string | null, updatedAt: string | null } }
   | null };

export type SingleDeviceAccountDeleteMutationVariables = Exact<{
  password: string;
}>;


export type SingleDeviceAccountDeleteMutation = { accountDelete:
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