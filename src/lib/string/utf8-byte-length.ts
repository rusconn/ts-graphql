const textEncoder = new TextEncoder();

export function utf8ByteLength(s: string) {
  return textEncoder.encode(s).byteLength;
}

if (import.meta.vitest) {
  const cases = [
    { s: "", len: 0 },
    { s: "abc", len: 3 },
    { s: "リポD", len: 7 }, // リ・ポが各3バイト
    { s: "𠮷野屋", len: 10 }, // サロゲートペア4バイト+3+3
    { s: "👨‍👩‍👧‍👦", len: 25 }, // 4+3+4+3+4+3+4
  ];

  test.each(cases)("%o", ({ s, len }) => {
    expect(utf8ByteLength(s)).toBe(len);
  });
}
