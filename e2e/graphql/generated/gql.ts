/* eslint-disable */
import * as types from './graphql.js';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    mutation SharedSignupRequest($email: String!) {\n      signupRequest(email: $email) {\n        __typename\n        ... on SignupRequestSuccess {\n          message\n        }\n      }\n    }\n  ": typeof types.SharedSignupRequestDocument,
    "\n    mutation SharedSignupComplete($token: String!, $name: String!, $password: String!) {\n      signupComplete(token: $token, name: $name, password: $password) {\n        __typename\n        ... on SignupCompleteSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  ": typeof types.SharedSignupCompleteDocument,
    "\n    mutation LogoutLoginAccountEmailChange($email: String!) {\n      accountEmailChange(email: $email) {\n        __typename\n        ... on AccountEmailChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  ": typeof types.LogoutLoginAccountEmailChangeDocument,
    "\n    mutation LogoutLoginAccountPasswordChange($oldPassword: String!, $newPassword: String!) {\n      accountPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {\n        __typename\n        ... on AccountPasswordChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  ": typeof types.LogoutLoginAccountPasswordChangeDocument,
    "\n    mutation LogoutLoginLogout($refreshToken: String!) {\n      logout(refreshToken: $refreshToken)\n    }\n  ": typeof types.LogoutLoginLogoutDocument,
    "\n    mutation LogoutLoginLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        __typename\n        ... on LoginSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  ": typeof types.LogoutLoginLoginDocument,
    "\n    query LogoutLoginViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.LogoutLoginViewerDocument,
    "\n    query MultiDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.MultiDeviceViewerDocument,
    "\n    mutation MultiDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  ": typeof types.MultiDeviceTodoCreateDocument,
    "\n    mutation MultiDeviceLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        __typename\n        ... on LoginSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  ": typeof types.MultiDeviceLoginDocument,
    "\n    mutation MultiDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.MultiDeviceTodoUpdateDocument,
    "\n    mutation MultiDeviceAccessTokenRefresh($refreshToken: String!) {\n      accessTokenRefresh(refreshToken: $refreshToken) {\n        __typename\n        ... on AccessTokenRefreshSuccess {\n          accessToken\n        }\n      }\n    }\n  ": typeof types.MultiDeviceAccessTokenRefreshDocument,
    "\n    mutation MultiDeviceTodoDelete($id: ID!) {\n      todoDelete(id: $id) {\n        __typename\n        ... on TodoDeleteSuccess {\n          id\n        }\n      }\n    }\n  ": typeof types.MultiDeviceTodoDeleteDocument,
    "\n    query RateLimitViewer {\n      viewer {\n        __typename\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 50) {\n          totalCount\n          pageInfo {\n            startCursor\n            endCursor\n            hasNextPage\n            hasPreviousPage\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.RateLimitViewerDocument,
    "\n    mutation SignupFlowSignupRequest($email: String!) {\n      signupRequest(email: $email) {\n        __typename\n        ... on SignupRequestSuccess {\n          message\n        }\n      }\n    }\n  ": typeof types.SignupFlowSignupRequestDocument,
    "\n    mutation SignupFlowSignupComplete($token: String!, $name: String!, $password: String!) {\n      signupComplete(token: $token, name: $name, password: $password) {\n        __typename\n        ... on SignupCompleteSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  ": typeof types.SignupFlowSignupCompleteDocument,
    "\n    query SignupFlowViewer {\n      viewer {\n        id\n        name\n        email\n      }\n    }\n  ": typeof types.SignupFlowViewerDocument,
    "\n    query SingleDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.SingleDeviceViewerDocument,
    "\n    mutation SingleDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  ": typeof types.SingleDeviceTodoCreateDocument,
    "\n    mutation SingleDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.SingleDeviceTodoUpdateDocument,
    "\n    mutation SingleDeviceAccessTokenRefresh($refreshToken: String!) {\n      accessTokenRefresh(refreshToken: $refreshToken) {\n        __typename\n        ... on AccessTokenRefreshSuccess {\n          accessToken\n        }\n      }\n    }\n  ": typeof types.SingleDeviceAccessTokenRefreshDocument,
    "\n    mutation SingleDeviceTodoStatusChange($id: ID!, $status: TodoStatus!) {\n      todoStatusChange(id: $id, status: $status) {\n        __typename\n        ... on TodoStatusChangeSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.SingleDeviceTodoStatusChangeDocument,
    "\n    query SingleDeviceAccountDeleteNode($id: ID!) {\n      node(id: $id) {\n        __typename\n        id\n      }\n    }\n  ": typeof types.SingleDeviceAccountDeleteNodeDocument,
    "\n    mutation SingleDeviceAccountDelete($password: String!) {\n      accountDelete(password: $password) {\n        __typename\n        ... on AccountDeleteSuccess {\n          id\n        }\n      }\n    }\n  ": typeof types.SingleDeviceAccountDeleteDocument,
};
const documents: Documents = {
    "\n    mutation SharedSignupRequest($email: String!) {\n      signupRequest(email: $email) {\n        __typename\n        ... on SignupRequestSuccess {\n          message\n        }\n      }\n    }\n  ": types.SharedSignupRequestDocument,
    "\n    mutation SharedSignupComplete($token: String!, $name: String!, $password: String!) {\n      signupComplete(token: $token, name: $name, password: $password) {\n        __typename\n        ... on SignupCompleteSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  ": types.SharedSignupCompleteDocument,
    "\n    mutation LogoutLoginAccountEmailChange($email: String!) {\n      accountEmailChange(email: $email) {\n        __typename\n        ... on AccountEmailChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  ": types.LogoutLoginAccountEmailChangeDocument,
    "\n    mutation LogoutLoginAccountPasswordChange($oldPassword: String!, $newPassword: String!) {\n      accountPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {\n        __typename\n        ... on AccountPasswordChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  ": types.LogoutLoginAccountPasswordChangeDocument,
    "\n    mutation LogoutLoginLogout($refreshToken: String!) {\n      logout(refreshToken: $refreshToken)\n    }\n  ": types.LogoutLoginLogoutDocument,
    "\n    mutation LogoutLoginLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        __typename\n        ... on LoginSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  ": types.LogoutLoginLoginDocument,
    "\n    query LogoutLoginViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.LogoutLoginViewerDocument,
    "\n    query MultiDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.MultiDeviceViewerDocument,
    "\n    mutation MultiDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  ": types.MultiDeviceTodoCreateDocument,
    "\n    mutation MultiDeviceLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        __typename\n        ... on LoginSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  ": types.MultiDeviceLoginDocument,
    "\n    mutation MultiDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.MultiDeviceTodoUpdateDocument,
    "\n    mutation MultiDeviceAccessTokenRefresh($refreshToken: String!) {\n      accessTokenRefresh(refreshToken: $refreshToken) {\n        __typename\n        ... on AccessTokenRefreshSuccess {\n          accessToken\n        }\n      }\n    }\n  ": types.MultiDeviceAccessTokenRefreshDocument,
    "\n    mutation MultiDeviceTodoDelete($id: ID!) {\n      todoDelete(id: $id) {\n        __typename\n        ... on TodoDeleteSuccess {\n          id\n        }\n      }\n    }\n  ": types.MultiDeviceTodoDeleteDocument,
    "\n    query RateLimitViewer {\n      viewer {\n        __typename\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 50) {\n          totalCount\n          pageInfo {\n            startCursor\n            endCursor\n            hasNextPage\n            hasPreviousPage\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.RateLimitViewerDocument,
    "\n    mutation SignupFlowSignupRequest($email: String!) {\n      signupRequest(email: $email) {\n        __typename\n        ... on SignupRequestSuccess {\n          message\n        }\n      }\n    }\n  ": types.SignupFlowSignupRequestDocument,
    "\n    mutation SignupFlowSignupComplete($token: String!, $name: String!, $password: String!) {\n      signupComplete(token: $token, name: $name, password: $password) {\n        __typename\n        ... on SignupCompleteSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  ": types.SignupFlowSignupCompleteDocument,
    "\n    query SignupFlowViewer {\n      viewer {\n        id\n        name\n        email\n      }\n    }\n  ": types.SignupFlowViewerDocument,
    "\n    query SingleDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.SingleDeviceViewerDocument,
    "\n    mutation SingleDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  ": types.SingleDeviceTodoCreateDocument,
    "\n    mutation SingleDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.SingleDeviceTodoUpdateDocument,
    "\n    mutation SingleDeviceAccessTokenRefresh($refreshToken: String!) {\n      accessTokenRefresh(refreshToken: $refreshToken) {\n        __typename\n        ... on AccessTokenRefreshSuccess {\n          accessToken\n        }\n      }\n    }\n  ": types.SingleDeviceAccessTokenRefreshDocument,
    "\n    mutation SingleDeviceTodoStatusChange($id: ID!, $status: TodoStatus!) {\n      todoStatusChange(id: $id, status: $status) {\n        __typename\n        ... on TodoStatusChangeSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.SingleDeviceTodoStatusChangeDocument,
    "\n    query SingleDeviceAccountDeleteNode($id: ID!) {\n      node(id: $id) {\n        __typename\n        id\n      }\n    }\n  ": types.SingleDeviceAccountDeleteNodeDocument,
    "\n    mutation SingleDeviceAccountDelete($password: String!) {\n      accountDelete(password: $password) {\n        __typename\n        ... on AccountDeleteSuccess {\n          id\n        }\n      }\n    }\n  ": types.SingleDeviceAccountDeleteDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SharedSignupRequest($email: String!) {\n      signupRequest(email: $email) {\n        __typename\n        ... on SignupRequestSuccess {\n          message\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SharedSignupRequestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SharedSignupComplete($token: String!, $name: String!, $password: String!) {\n      signupComplete(token: $token, name: $name, password: $password) {\n        __typename\n        ... on SignupCompleteSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SharedSignupCompleteDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogoutLoginAccountEmailChange($email: String!) {\n      accountEmailChange(email: $email) {\n        __typename\n        ... on AccountEmailChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').LogoutLoginAccountEmailChangeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogoutLoginAccountPasswordChange($oldPassword: String!, $newPassword: String!) {\n      accountPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {\n        __typename\n        ... on AccountPasswordChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').LogoutLoginAccountPasswordChangeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogoutLoginLogout($refreshToken: String!) {\n      logout(refreshToken: $refreshToken)\n    }\n  "): typeof import('./graphql.js').LogoutLoginLogoutDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogoutLoginLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        __typename\n        ... on LoginSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  "): typeof import('./graphql.js').LogoutLoginLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query LogoutLoginViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').LogoutLoginViewerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MultiDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceViewerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MultiDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceTodoCreateDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MultiDeviceLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        __typename\n        ... on LoginSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MultiDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceTodoUpdateDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MultiDeviceAccessTokenRefresh($refreshToken: String!) {\n      accessTokenRefresh(refreshToken: $refreshToken) {\n        __typename\n        ... on AccessTokenRefreshSuccess {\n          accessToken\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceAccessTokenRefreshDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MultiDeviceTodoDelete($id: ID!) {\n      todoDelete(id: $id) {\n        __typename\n        ... on TodoDeleteSuccess {\n          id\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceTodoDeleteDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RateLimitViewer {\n      viewer {\n        __typename\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 50) {\n          totalCount\n          pageInfo {\n            startCursor\n            endCursor\n            hasNextPage\n            hasPreviousPage\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').RateLimitViewerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SignupFlowSignupRequest($email: String!) {\n      signupRequest(email: $email) {\n        __typename\n        ... on SignupRequestSuccess {\n          message\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SignupFlowSignupRequestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SignupFlowSignupComplete($token: String!, $name: String!, $password: String!) {\n      signupComplete(token: $token, name: $name, password: $password) {\n        __typename\n        ... on SignupCompleteSuccess {\n          accessToken\n          refreshToken\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SignupFlowSignupCompleteDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SignupFlowViewer {\n      viewer {\n        id\n        name\n        email\n      }\n    }\n  "): typeof import('./graphql.js').SignupFlowViewerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SingleDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceViewerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceTodoCreateDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceTodoUpdateDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceAccessTokenRefresh($refreshToken: String!) {\n      accessTokenRefresh(refreshToken: $refreshToken) {\n        __typename\n        ... on AccessTokenRefreshSuccess {\n          accessToken\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceAccessTokenRefreshDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceTodoStatusChange($id: ID!, $status: TodoStatus!) {\n      todoStatusChange(id: $id, status: $status) {\n        __typename\n        ... on TodoStatusChangeSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceTodoStatusChangeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SingleDeviceAccountDeleteNode($id: ID!) {\n      node(id: $id) {\n        __typename\n        id\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceAccountDeleteNodeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceAccountDelete($password: String!) {\n      accountDelete(password: $password) {\n        __typename\n        ... on AccountDeleteSuccess {\n          id\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceAccountDeleteDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
