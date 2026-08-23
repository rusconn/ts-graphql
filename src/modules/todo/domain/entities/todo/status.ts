import { err, ok, type Result } from "neverthrow";

const DONE = "DONE";
const PENDING = "PENDING";

export type Status = typeof DONE | typeof PENDING;

export type ParseError = typeof invalidStatusError;

export const invalidStatusError = {
  type: "invalid status",
} as const;

export const Status = {
  DONE,
  PENDING,

  parse(input: string): Result<Status, ParseError> {
    switch (input) {
      case "done":
      case "Done":
      case "DONE":
        return ok(DONE);
      case "pending":
      case "Pending":
      case "PENDING":
        return ok(PENDING);
      default:
        return err(invalidStatusError);
    }
  },
} as const;
