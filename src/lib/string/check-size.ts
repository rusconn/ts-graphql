import { numGraphemes } from "./num-graphemes.ts";
import { utf8ByteLength } from "./utf8-byte-length.ts";

export type StringSizeOptions = {
  minGraphemes?: number;
  maxGraphemes?: number;
  maxBytes?: number;
};

export type StringSizeResult =
  | { kind: "ok" }
  | { kind: "too-short" }
  | { kind: "too-long" }
  | { kind: "too-large" };

export function checkStringSize(s: string, options: StringSizeOptions): StringSizeResult {
  const { minGraphemes, maxGraphemes, maxBytes } = options;

  const codeUnits = s.length;

  // graphemes <= codeUnitsが常に成り立つ。1グラフィームは1つ以上のコードユニットで構成されるため。
  if (minGraphemes != null && codeUnits < minGraphemes) {
    return { kind: "too-short" };
  }

  const checkMinCount = minGraphemes != null && minGraphemes > 1;
  const checkMaxCount = maxGraphemes != null && maxGraphemes < codeUnits;

  if (checkMinCount || checkMaxCount) {
    const graphemes = numGraphemes(s);
    if (checkMinCount && graphemes < minGraphemes) {
      return { kind: "too-short" };
    }
    if (checkMaxCount && maxGraphemes < graphemes) {
      return { kind: "too-long" };
    }
  }

  if (maxBytes != null) {
    // 1コードユニットは最大で3バイトになる
    if (maxBytes < codeUnits || (maxBytes < 3 * codeUnits && maxBytes < utf8ByteLength(s))) {
      return { kind: "too-large" };
    }
  }

  return { kind: "ok" };
}

if (import.meta.vitest) {
  it("returns ok when within ASCII limits", () => {
    expect(checkStringSize("abc", { maxGraphemes: 3 })).toStrictEqual({ kind: "ok" });
  });

  it("returns too-short for an empty string with minGraphemes 1", () => {
    expect(checkStringSize("", { minGraphemes: 1 })).toStrictEqual({ kind: "too-short" });
  });

  it("counts combining characters for minGraphemes > 1", () => {
    expect(checkStringSize("a\u0301".repeat(4), { minGraphemes: 8 })).toStrictEqual({
      kind: "too-short",
    });
    expect(checkStringSize("a\u0301".repeat(8), { minGraphemes: 8 })).toStrictEqual({
      kind: "ok",
    });
  });

  it("treats minGraphemes 1 as satisfied by any non-empty string", () => {
    expect(checkStringSize("a\u0301", { minGraphemes: 1 })).toStrictEqual({ kind: "ok" });
  });

  it("returns too-long when graphemes exceed maxGraphemes", () => {
    expect(checkStringSize("a".repeat(101), { maxGraphemes: 100 })).toStrictEqual({
      kind: "too-long",
    });
  });

  it("treats CRLF as a single grapheme", () => {
    expect(checkStringSize("a\r\nb", { maxGraphemes: 3 })).toStrictEqual({ kind: "ok" });
    expect(checkStringSize("a\r\nb", { maxGraphemes: 2 })).toStrictEqual({ kind: "too-long" });
  });

  it("counts surrogate pairs as two code units but one grapheme", () => {
    expect(checkStringSize("𠮷".repeat(51), { maxGraphemes: 50 })).toStrictEqual({
      kind: "too-long",
    });
  });

  it("returns too-large when bytes exceed maxBytes even if graphemes fit", () => {
    expect(
      checkStringSize("a\u0301".repeat(400), { maxGraphemes: 500, maxBytes: 1_000 }),
    ).toStrictEqual({ kind: "too-large" });
  });

  it("returns too-large from code-unit length alone", () => {
    expect(checkStringSize("x".repeat(2_000), { maxBytes: 1_000 })).toStrictEqual({
      kind: "too-large",
    });
  });

  it("accepts strings at the 3x code-unit byte boundary", () => {
    expect(checkStringSize("あ".repeat(333), { maxBytes: 1_000 })).toStrictEqual({ kind: "ok" });
    expect(checkStringSize("あ".repeat(334), { maxBytes: 1_000 })).toStrictEqual({
      kind: "too-large",
    });
  });
}
