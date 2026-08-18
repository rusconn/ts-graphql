import { entities } from "../_shared/data.ts";
import { clearTables, seeders } from "../_shared/helpers.ts";
import { graphql } from "./generated/gql.ts";
import { TodoStatus } from "./generated/graphql.ts";
import { executeSingleResultOperation } from "./helpers/server.ts";
import { signup } from "./helpers/signup.ts";

const viewer = executeSingleResultOperation(
  graphql(/* GraphQL */ `
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
  `),
);

const todoCreate = executeSingleResultOperation(
  graphql(/* GraphQL */ `
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
  `),
);

const todoUpdate = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation SingleDeviceTodoUpdate(
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
    mutation SingleDeviceAccessTokenRefresh($refreshToken: String!) {
      accessTokenRefresh(refreshToken: $refreshToken) {
        __typename
        ... on AccessTokenRefreshSuccess {
          accessToken
        }
      }
    }
  `),
);

const todoStatusChange = executeSingleResultOperation(
  graphql(/* GraphQL */ `
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
  `),
);

const accountDelete = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation SingleDeviceAccountDelete($password: String!) {
      accountDelete(password: $password) {
        __typename
        ... on AccountDeleteSuccess {
          id
        }
      }
    }
  `),
);

test("single-device", async () => {
  await clearTables();

  let accessToken1: string;
  let refreshToken1: string;
  {
    const { accessToken, refreshToken } = await signup({
      name: "single-device",
      email: "single-device@example.com",
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
    expect(data.viewer.name).toBe("single-device");
    expect(data.viewer.email).toBe("single-device@example.com");
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
    // default values
    expect(data.todoCreate.todo.title).toBe("");
    expect(data.todoCreate.todo.description).toBe("");
    expect(data.todoCreate.todo.status).toBe(TodoStatus.Pending);
    todoId = data.todoCreate.todo.id;
  }

  {
    const { data } = await todoUpdate({
      accessToken: accessToken1,
      variables: {
        id: todoId,
        title: "single-device-todo-title",
        description: "single-device-todo-desc",
      },
    });
    assert(
      data?.todoUpdate?.__typename === "TodoUpdateSuccess", //
      data?.todoUpdate?.__typename,
    );
  }

  let accessToken2: string;
  {
    const { data } = await accessTokenRefresh({
      variables: {
        refreshToken: refreshToken1,
      },
    });
    assert(
      data?.accessTokenRefresh?.__typename === "AccessTokenRefreshSuccess", //
      data?.accessTokenRefresh?.__typename,
    );
    accessToken2 = data.accessTokenRefresh.accessToken;
  }

  {
    const { data } = await todoStatusChange({
      accessToken: accessToken2,
      variables: {
        id: todoId,
        status: TodoStatus.Done,
      },
    });
    assert(
      data?.todoStatusChange?.__typename === "TodoStatusChangeSuccess", //
      data?.todoStatusChange?.__typename,
    );
  }

  await seeders.users(entities.users.alice);

  {
    const { data } = await accountDelete({
      accessToken: accessToken2,
      variables: {
        password: "password",
      },
    });
    assert(
      data?.accountDelete?.__typename === "AccountDeleteSuccess", //
      data?.accountDelete?.__typename,
    );
  }
});
