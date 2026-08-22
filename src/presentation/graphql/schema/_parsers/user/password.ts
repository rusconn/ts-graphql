import * as User from "../../../../../domain/entities/user.ts";
import { parseArgNullabilityWithDomain } from "../_shared/arg.ts";
import { stringTooLongError, stringTooShortError } from "../_shared/error.ts";

export const parseUserPassword = parseArgNullabilityWithDomain(
  User.Password.parse, //
  (e, argName) => {
    switch (e.type) {
      case "too short":
        return stringTooShortError(argName, e.min);
      case "too long":
        return stringTooLongError(argName, e.max);
    }
  },
);
