import * as User from "../../../../../domain/entities/user.ts";
import { parseArgNullabilityWithDomain } from "../_shared/arg.ts";
import { ParseErr, stringTooLongError } from "../_shared/error.ts";

export const parseUserEmail = parseArgNullabilityWithDomain(
  User.Email.parse, //
  (e, argName) => {
    switch (e.type) {
      case "too long":
        return stringTooLongError(argName, e.max);
      case "invalid format":
        return new ParseErr(argName, "invalid format");
    }
  },
);
