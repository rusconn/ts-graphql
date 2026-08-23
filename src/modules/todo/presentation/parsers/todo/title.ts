import {
  parseArgNullabilityWithDomain,
  stringTooLargeError,
  stringTooLongError,
} from "../../../../shared/mod.ts";
import { Entity } from "../../../domain/entities/todo.ts";

export const parseTodoTitle = parseArgNullabilityWithDomain(
  Entity.Title.parse, //
  (e, argName) => {
    switch (e.type) {
      case "too long":
        return stringTooLongError(argName, e.max);
      case "size too large":
        return stringTooLargeError(argName);
    }
  },
);
