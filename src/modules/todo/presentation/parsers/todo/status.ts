import { parseArgNullabilityWithDomain, ParseErr } from "../../../../shared/mod.ts";
import { Entity } from "../../../domain/entities/todo.ts";

export const parseTodoStatus = parseArgNullabilityWithDomain(
  Entity.Status.parse, //
  (e, argName) => {
    switch (e.type) {
      case "invalid status":
        return new ParseErr(argName, "invalid status");
    }
  },
);
