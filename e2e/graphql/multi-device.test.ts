import { clearTables } from "../_shared/helpers.ts";
import { graphql } from "./generated/gql.ts";
import { executeSingleResultOperation } from "./helpers/server.ts";
import { signup } from "./helpers/signup.ts";

const viewer = executeSingleResultOperation(
  graphql(/* GraphQL */ `
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
  `),
);

const todoCreate = executeSingleResultOperation(
  graphql(/* GraphQL */ `
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
  `),
);

const login = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation MultiDeviceLogin($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        __typename
        ... on LoginSuccess {
          accessToken
          refreshToken
        }
      }
    }
  `),
);

const todoUpdate = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation MultiDeviceTodoUpdate(
      $id: ID!
      $title: String
      $description: String
      $status: TodoStatus
    ) {
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
  `),
);

const accessTokenRefresh = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation MultiDeviceAccessTokenRefresh($refreshToken: String!) {
      accessTokenRefresh(refreshToken: $refreshToken) {
        __typename
        ... on AccessTokenRefreshSuccess {
          accessToken
        }
      }
    }
  `),
);

const todoDelete = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation MultiDeviceTodoDelete($id: ID!) {
      todoDelete(id: $id) {
        __typename
        ... on TodoDeleteSuccess {
          id
        }
      }
    }
  `),
);

test("multi-device", async () => {
  await clearTables();

  let accessToken1: string;
  let refreshToken1: string;
  {
    const { accessToken, refreshToken } = await signup({
      name: "multi-device",
      email: "multi-device@example.com",
      password: "password",
    });
    accessToken1 = accessToken;
    refreshToken1 = refreshToken;
  }

  {
    const { data } = await viewer({
      accessToken: accessToken1,
    });
    assert(data?.viewer);
    expect(data.viewer.name).toBe("multi-device");
    expect(data.viewer.email).toBe("multi-device@example.com");
    expect(data.viewer.todos?.totalCount).toBe(0);
  }

  let todoId: string;
  {
    const { data } = await todoCreate({
      accessToken: accessToken1,
    });
    assert(
      data?.todoCreate?.__typename === "TodoCreateSuccess", //
      data?.todoCreate?.__typename,
    );
    todoId = data.todoCreate.todo.id;
  }

  let accessToken2: string;
  let refreshToken2: string;
  {
    const { data } = await login({
      variables: {
        email: "multi-device@example.com",
        password: "password",
      },
    });
    assert(
      data?.login?.__typename === "LoginSuccess", //
      data?.login?.__typename,
    );
    accessToken2 = data.login.accessToken;
    refreshToken2 = data.login.refreshToken;
  }

  {
    const { data } = await viewer({
      accessToken: accessToken2,
    });
    assert(data?.viewer);
    expect(data.viewer.name).toBe("multi-device");
    expect(data.viewer.email).toBe("multi-device@example.com");
    expect(data.viewer.todos?.totalCount).toBe(1);
  }

  {
    const { data } = await todoUpdate({
      accessToken: accessToken2,
      variables: {
        id: todoId,
        title: "multi-device-todo-title",
        description: "multi-device-todo-desc",
      },
    });
    assert(
      data?.todoUpdate?.__typename === "TodoUpdateSuccess", //
      data?.todoUpdate?.__typename,
    );
  }

  let accessToken1_2: string;
  {
    const { data } = await accessTokenRefresh({
      accessToken: accessToken1,
      variables: {
        refreshToken: refreshToken1,
      },
    });
    assert(
      data?.accessTokenRefresh?.__typename === "AccessTokenRefreshSuccess", //
      data?.accessTokenRefresh?.__typename,
    );
    accessToken1_2 = data.accessTokenRefresh.accessToken;
  }

  {
    const { data } = await todoDelete({
      accessToken: accessToken1_2,
      variables: {
        id: todoId,
      },
    });
    assert(
      data?.todoDelete?.__typename === "TodoDeleteSuccess", //
      data?.todoDelete?.__typename,
    );
  }

  {
    const { data } = await viewer({
      accessToken: accessToken1_2,
    });
    assert(data?.viewer);
    expect(data.viewer.todos?.totalCount).toBe(0);
  }

  let accessToken2_2: string;
  {
    const { data } = await accessTokenRefresh({
      accessToken: accessToken2,
      variables: {
        refreshToken: refreshToken2,
      },
    });
    assert(
      data?.accessTokenRefresh?.__typename === "AccessTokenRefreshSuccess", //
      data?.accessTokenRefresh?.__typename,
    );
    accessToken2_2 = data.accessTokenRefresh.accessToken;
  }

  {
    const { data } = await viewer({
      accessToken: accessToken2_2,
    });
    assert(data?.viewer);
    expect(data.viewer.todos?.totalCount).toBe(0);
  }
});
