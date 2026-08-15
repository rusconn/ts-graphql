import { clearTables } from "../_shared/helpers.ts";
import { graphql } from "./_shared/gql.ts";
import { executeSingleResultOperation } from "./_shared/server.ts";

const signup = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation LogoutLoginSignup($name: String!, $email: String!, $password: String!) {
      signup(name: $name, email: $email, password: $password) {
        __typename
        ... on SignupSuccess {
          accessToken
          refreshToken
        }
      }
    }
  `),
);

const accountEmailChange = executeSingleResultOperation(
  graphql(/* GraphQL */ `
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
  `),
);

const accountPasswordChange = executeSingleResultOperation(
  graphql(/* GraphQL */ `
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
  `),
);

const logout = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation LogoutLoginLogout($refreshToken: String!) {
      logout(refreshToken: $refreshToken)
    }
  `),
);

const login = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation LogoutLoginLogin($email: String!, $password: String!) {
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

const viewer = executeSingleResultOperation(
  graphql(/* GraphQL */ `
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
  `),
);

test("logout-login", async () => {
  await clearTables();

  let accessToken1: string;
  let refreshToken1: string;
  {
    const { data } = await signup({
      variables: {
        name: "logout-login",
        email: "logout-login@example.com",
        password: "password",
      },
    });
    assert(
      data?.signup?.__typename === "SignupSuccess", //
      data?.signup?.__typename,
    );
    accessToken1 = data.signup.accessToken;
    refreshToken1 = data.signup.refreshToken;
  }

  {
    const { data } = await viewer({
      accessToken: accessToken1,
    });
    assert(data?.viewer);
    expect(data.viewer.name).toBe("logout-login");
    expect(data.viewer.email).toBe("logout-login@example.com");
  }

  {
    const { data } = await accountEmailChange({
      accessToken: accessToken1,
      variables: {
        email: "logout-login-2@example.com",
      },
    });
    assert(
      data?.accountEmailChange?.__typename === "AccountEmailChangeSuccess",
      data?.accountEmailChange?.__typename,
    );
  }

  {
    const { data } = await accountPasswordChange({
      accessToken: accessToken1,
      variables: {
        oldPassword: "password",
        newPassword: "password-2",
      },
    });
    assert(
      data?.accountPasswordChange?.__typename === "AccountPasswordChangeSuccess",
      data?.accountPasswordChange?.__typename,
    );
  }

  {
    const { errors } = await logout({
      accessToken: accessToken1,
      variables: {
        refreshToken: refreshToken1,
      },
    });
    expect(errors).toBeUndefined();
  }

  let accessToken2: string;
  {
    const { data } = await login({
      accessToken: accessToken1,
      variables: {
        email: "logout-login-2@example.com",
        password: "password-2",
      },
    });
    assert(
      data?.login?.__typename === "LoginSuccess", //
      data?.login?.__typename,
    );
    accessToken2 = data.login.accessToken;
  }

  {
    const { data } = await viewer({
      accessToken: accessToken2, // new token
    });
    assert(data?.viewer);
    expect(data.viewer.name).toBe("logout-login");
    expect(data.viewer.email).toBe("logout-login-2@example.com");
  }
});
