import type { Result } from "neverthrow";

import type { ParseErr } from "../_shared/error.ts";

export function testParseArgs<Args>(
  parseArgs: (args: Args) => Result<unknown, ParseErr | ParseErr[]>,
  cases: {
    valids: Args[];
    invalids: [Args, (keyof Args)[]][];
  },
) {
  describe("parsing", () => {
    it.each(cases.valids)("succeeds when args is valid: %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    it.each(cases.invalids)("failes when args is invalid: %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      const err = parsed._unsafeUnwrapErr();
      const errs = Array.isArray(err) ? err : [err];
      expect(errs.map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
