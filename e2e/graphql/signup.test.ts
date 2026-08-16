import * as EmailVerification from "../../src/application/usecases/signup/_email-verification.ts";
import { User } from "../../src/domain/entities.ts";
import { clearTables } from "../_shared/helpers.ts";
import { graphql } from "./generated/gql.ts";
import { executeSingleResultOperation } from "./helpers/server.ts";

const signupRequest = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation SignupFlowSignupRequest($email: String!) {
      signupRequest(email: $email) {
        __typename
        ... on SignupRequestSuccess {
          message
        }
      }
    }
  `),
);

const signupComplete = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation SignupFlowSignupComplete($token: String!, $name: String!, $password: String!) {
      signupComplete(token: $token, name: $name, password: $password) {
        __typename
        ... on SignupCompleteSuccess {
          accessToken
          refreshToken
        }
      }
    }
  `),
);

const viewer = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    query SignupFlowViewer {
      viewer {
        id
        name
        email
      }
    }
  `),
);

function issueToken(email: User.Email.Type) {
  return EmailVerification.sign(email);
}

test("signup", async () => {
  await clearTables();

  const email = User.Email.parse(`signup-${crypto.randomUUID()}@example.com`)._unsafeUnwrap();

  {
    const { data } = await signupRequest({ variables: { email } });
    assert(
      data?.signupRequest?.__typename === "SignupRequestSuccess",
      data?.signupRequest?.__typename,
    );
  }

  {
    const { data } = await signupRequest({ variables: { email } });
    assert(
      data?.signupRequest?.__typename === "SignupRequestSuccess",
      data?.signupRequest?.__typename,
    );
  }

  const token = await issueToken(email);

  {
    const { data } = await signupComplete({
      variables: { token, name: "signup", password: "password" },
    });
    assert(
      data?.signupComplete?.__typename === "SignupCompleteSuccess",
      data?.signupComplete?.__typename,
    );

    const { data: viewerData } = await viewer({
      accessToken: data.signupComplete.accessToken,
    });
    assert(viewerData?.viewer);
    expect(viewerData.viewer.name).toBe("signup");
    expect(viewerData.viewer.email).toBe(email);
  }

  {
    const { data } = await signupComplete({
      variables: { token, name: "signup-2", password: "password" },
    });
    assert(
      data?.signupComplete?.__typename === "EmailAlreadyTakenError",
      data?.signupComplete?.__typename,
    );
  }

  {
    const { data } = await signupRequest({ variables: { email } });
    assert(
      data?.signupRequest?.__typename === "SignupRequestSuccess",
      data?.signupRequest?.__typename,
    );
  }

  {
    const { data } = await signupComplete({
      variables: {
        token: "not-a-jwt",
        name: "signup-3",
        password: "password",
      },
    });
    assert(
      data?.signupComplete?.__typename === "InvalidVerificationTokenError",
      data?.signupComplete?.__typename,
    );
  }
});
