import {
  parseArgNullabilityWithDomain,
  ParseErr,
  stringTooLongError,
} from "../../../../shared/mod.ts";
import { Entity } from "../../../domain/entities/user.ts";

export const parseUserEmail = parseArgNullabilityWithDomain(
  Entity.Email.parse, //
  (e, argName) => {
    switch (e.type) {
      case "too long":
        return stringTooLongError(argName, e.max);
      case "invalid format":
        return new ParseErr(argName, "invalid format");
    }
  },
);
