export type CleanseOptions = {
  lowercase?: boolean;
  collapseWhitespace?: boolean;
};

export function cleanseText(input: string, options: CleanseOptions = {}): string {
  let s = input
    .normalize("NFKC")
    .replace(/\p{Cc}/gu, (match) =>
      match === "\t" || match === "\n" || match === "\r" ? match : "",
    )
    .replace(/\p{Cf}/gu, (match) => (match === "\u200C" || match === "\u200D" ? match : ""));

  if (options.collapseWhitespace) {
    s = s.replace(/\s+/gu, " ");
  }

  s = s.trim();

  if (options.lowercase) {
    s = s.toLowerCase();
  }

  return s;
}

if (import.meta.vitest) {
  it.each([
    { input: " ＡＢＣ ", expected: "ABC" },
    { input: "　abc　", expected: "abc" },
    { input: "０１２", expected: "012" },
  ] as const)("normalizes full-width characters: %#", ({ input, expected }) => {
    expect(cleanseText(input)).toBe(expected);
  });

  it.each([
    { input: "a\u0007b\u001Fc", expected: "abc" },
    { input: "a\u0000b\u009Fc", expected: "abc" },
  ] as const)("removes control characters: %#", ({ input, expected }) => {
    expect(cleanseText(input)).toBe(expected);
  });

  it.each([
    { input: "a\tb\nc\r\nd", expected: "a\tb\nc\r\nd" },
    { input: "a\u2028b\u2029c", expected: "a\u2028b\u2029c" },
  ] as const)("preserves tabs and newlines: %#", ({ input, expected }) => {
    expect(cleanseText(input)).toBe(expected);
  });

  it.each([
    { input: "a\u200Bb", expected: "ab" },
    { input: "\uFEFFa", expected: "a" },
    { input: "a\u00ADb", expected: "ab" },
  ] as const)("removes zero-width and invisible format characters: %#", ({ input, expected }) => {
    expect(cleanseText(input)).toBe(expected);
  });

  it.each([
    { input: "a\u200Cb\u200Dc", expected: "a\u200Cb\u200Dc" },
    { input: "👨\u200D👩\u200D👧\u200D👦", expected: "👨\u200D👩\u200D👧\u200D👦" },
  ] as const)("preserves ZWJ and ZWNJ: %#", ({ input, expected }) => {
    expect(cleanseText(input)).toBe(expected);
  });

  it("trims leading and trailing whitespace", () => {
    expect(cleanseText("  abc  ")).toBe("abc");
  });

  it("collapses whitespace when specified", () => {
    expect(cleanseText("a\n\nb\t c  d", { collapseWhitespace: true })).toBe("a b c d");
  });

  it("lowercases when specified", () => {
    expect(cleanseText(" Foo\u200B@EXAMPLE.COM ", { lowercase: true })).toBe("foo@example.com");
  });

  it("does not remove internal whitespace by default", () => {
    expect(cleanseText("a b@x.com", { lowercase: true })).toBe("a b@x.com");
  });

  it("normalizes full-width email characters before lowercasing", () => {
    expect(cleanseText("ＦＯＯ＠ＥＸＡＭＰＬＥ．ＣＯＭ", { lowercase: true })).toBe(
      "foo@example.com",
    );
  });
}
