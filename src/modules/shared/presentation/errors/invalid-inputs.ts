import type { ParseErr } from "../parsers/error.ts";

type InvalidInputError = {
  __typename?: "InvalidInputError";
  field: string;
  message: string;
};

export type InvalidInputErrors = {
  __typename?: "InvalidInputErrors";
  errors: InvalidInputError[];
};

export function invalidInputErrors(errors: ParseErr[]): Required<InvalidInputErrors> {
  return {
    __typename: "InvalidInputErrors",
    errors: errors.map((e) => ({
      field: e.field,
      message: e.message,
    })),
  };
}
