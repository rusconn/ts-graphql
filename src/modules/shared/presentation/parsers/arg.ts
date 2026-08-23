import { err, ok, type Result } from "neverthrow";

import { ParseErr } from "./error.ts";

export function parseArgNullabilityWithDomain<
  Arg extends string, //
  Output,
  ParseError extends { type: string },
>(
  domainParser: (arg: Arg) => Result<Output, ParseError>,
  errorMapper: (e: ParseError, argName: string) => ParseErr,
) {
  return <
    Args extends Partial<Record<ArgName, Arg | null>>,
    ArgName extends keyof Args & string,
    Optional extends boolean,
    Nullable extends boolean,
  >(
    args: Args,
    argName: ArgName,
    nullability: {
      optional: Optional;
      nullable: Nullable;
    },
  ) => {
    return parseArgNullability(args, argName, nullability).andThen((v) =>
      v == null
        ? (ok(v) as unknown as Result<
            Optional extends true
              ? Nullable extends true
                ? null | undefined
                : undefined
              : Nullable extends true
                ? null
                : never,
            never
          >)
        : domainParser(v).mapErr((e) => errorMapper(e, argName)),
    );
  };
}

export function parseArgNullability<
  Args extends Partial<Record<string, unknown>>,
  ArgName extends keyof Args & string,
  Optional extends boolean,
  Nullable extends boolean,
>(
  args: Args,
  argName: ArgName,
  { optional, nullable }: { optional: Optional; nullable: Nullable },
): Result<
  Optional extends true
    ? Nullable extends true
      ? Args[ArgName]
      : Exclude<Args[ArgName], null>
    : Nullable extends true
      ? Exclude<Args[ArgName], undefined>
      : NonNullable<Args[ArgName]>,
  ParseErr
> {
  const arg = args[argName];
  if (!optional && arg === undefined) {
    return err(new ParseErr(argName, `${argName} is required.`));
  }
  if (!nullable && arg === null) {
    return err(new ParseErr(argName, `The ${argName} must not be null.`));
  }
  return ok(arg) as any;
}
