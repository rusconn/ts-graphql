import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
import type { ExecutionResult } from "graphql";

import { endpoint } from "../../../src/config/url.ts";
import { yoga } from "../../../src/presentation/graphql/yoga.ts";

type ExecuteOperationParams<TVariables> = {
  accessToken?: string;
  variables?: TVariables;
};

export function executeSingleResultOperation<
  TData extends Record<string, any>,
  TVariables extends Record<string, any>,
>(document: DocumentTypeDecoration<TData, TVariables>) {
  return async ({ accessToken, variables }: ExecuteOperationParams<TVariables>) => {
    const response = await yoga.fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken != null && {
          authorization: `Bearer ${accessToken}`,
        }),
      },
      body: JSON.stringify({
        query: document.toString(),
        ...(variables != null && {
          variables,
        }),
      }),
    });

    const result = (await response.json()) as ExecutionResult<TData>;

    return {
      status: response.status,
      headers: response.headers,
      ...result,
    };
  };
}
