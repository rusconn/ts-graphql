import {
  parseArgNullabilityWithDomain,
  stringTooLargeError,
  stringTooLongError,
} from "../../../../shared/mod.ts";
import { Entity } from "../../../domain/entities/todo.ts";

export const parseTodoDescription = parseArgNullabilityWithDomain(
  Entity.Description.parse, //
  (e, argName) => {
    switch (e.type) {
      case "too long":
        return stringTooLongError(argName, e.max);
      case "size too large":
        return stringTooLargeError(argName);
    }
  },
);
