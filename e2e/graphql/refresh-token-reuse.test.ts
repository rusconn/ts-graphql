import { clearTables } from "../_shared/helpers.ts";
import { graphql } from "./generated/gql.ts";
import { executeSingleResultOperation } from "./helpers/server.ts";
import { signup } from "./helpers/signup.ts";

const accessTokenRefresh = executeSingleResultOperation(
  graphql(/* GraphQL */ `
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
  `),
);

test("refresh-token-reuse", async () => {
  await clearTables();

  const { refreshToken: refreshToken1 } = await signup({
    name: "refresh-token-reuse",
    email: "refresh-token-reuse@example.com",
    password: "password",
  });

  let refreshToken2: string;
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
    refreshToken2 = data.accessTokenRefresh.refreshToken;
  }

  {
    const { data } = await accessTokenRefresh({
      variables: {
        refreshToken: refreshToken1,
      },
    });
    expect(data?.accessTokenRefresh?.__typename).toBe("RefreshTokenReuseError");
  }

  {
    const { data } = await accessTokenRefresh({
      variables: {
        refreshToken: refreshToken2,
      },
    });
    expect(data?.accessTokenRefresh?.__typename).toBe("InvalidRefreshTokenError");
  }
});
