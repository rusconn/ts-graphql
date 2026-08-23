import {
  parseArgNullabilityWithDomain,
  stringTooLargeError,
  stringTooLongError,
  stringTooShortError,
} from "../../../../shared/mod.ts";
import { Entity } from "../../../domain/entities/user.ts";

export const parseUserName = parseArgNullabilityWithDomain(
  Entity.Name.parse, //
  (e, argName) => {
    switch (e.type) {
      case "too short":
        return stringTooShortError(argName, e.min);
      case "too long":
        return stringTooLongError(argName, e.max);
      case "size too large":
        return stringTooLargeError(argName);
    }
  },
);
