import * as EmailVerification from "../../../src/application/usecases/signup/_email-verification.ts";
import { User } from "../../../src/domain/entities.ts";
import { graphql } from "../generated/gql.ts";
import { executeSingleResultOperation } from "./server.ts";

const signupRequest = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    mutation SharedSignupRequest($email: String!) {
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
    mutation SharedSignupComplete($token: String!, $name: String!, $password: String!) {
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

export async function signup(input: { name: string; email: string; password: string }) {
  const requestResult = await signupRequest({
    variables: {
      email: input.email,
    },
  });
  assert(
    requestResult.data?.signupRequest?.__typename === "SignupRequestSuccess",
    requestResult.data?.signupRequest?.__typename,
  );

  const token = await EmailVerification.sign(User.Email.parse(input.email)._unsafeUnwrap());

  const completeResult = await signupComplete({
    variables: {
      token,
      name: input.name,
      password: input.password,
    },
  });
  assert(
    completeResult.data?.signupComplete?.__typename === "SignupCompleteSuccess",
    completeResult.data?.signupComplete?.__typename,
  );

  return {
    accessToken: completeResult.data.signupComplete.accessToken,
    refreshToken: completeResult.data.signupComplete.refreshToken,
  };
}
