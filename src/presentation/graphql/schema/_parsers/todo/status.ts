import { Todo } from "../../../../../domain/entities.ts";
import { parseArgNullabilityWithDomain } from "../_shared/arg.ts";
import { ParseErr } from "../_shared/error.ts";

export const parseTodoStatus = parseArgNullabilityWithDomain(
  Todo.Status.parse, //
  (e, argName) => {
    switch (e.type) {
      case "invalid status":
        return new ParseErr(argName, "invalid status");
    }
  },
);
