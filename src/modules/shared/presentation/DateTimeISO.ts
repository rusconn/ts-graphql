import { DateTimeISOResolver } from "graphql-scalars";
import type { Tagged } from "type-fest";

export type DateTimeISO = Tagged<string, "DateTimeISO">;

export const resolver = DateTimeISOResolver;
