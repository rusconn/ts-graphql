import { Todo } from "../../../../../domain/entities.ts";
import { parseArgNullabilityWithDomain } from "../_shared/arg.ts";
import { stringTooLargeError, stringTooLongError } from "../_shared/error.ts";

export const parseTodoDescription = parseArgNullabilityWithDomain(
  Todo.Description.parse, //
  (e, argName) => {
    switch (e.type) {
      case "too long":
        return stringTooLongError(argName, e.max);
      case "size too large":
        return stringTooLargeError(argName);
    }
  },
);
