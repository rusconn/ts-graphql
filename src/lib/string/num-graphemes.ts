const segmenter = new Intl.Segmenter(undefined, {
  granularity: "grapheme",
});

export function numGraphemes(s: string) {
  let count = 0;
  for (const _ of segmenter.segment(s)) {
    count++;
  }
  return count;
}

if (import.meta.vitest) {
  const cases = [
    { s: "", num: 0 },
    { s: "abc", num: 3 },
    { s: "リポD", num: 3 },
    { s: "𠮷野屋", num: 3 }, // サロゲートペアを含む
    { s: "👨‍👩‍👧‍👦", num: 1 }, // 4文字を3つのZWJにより結合したもの
    { s: "a👨‍👩‍👧‍👦c", num: 3 },
    { s: "a\u0301", num: 1 }, // 結合文字は1グラフィーム
    { s: "🇯🇵", num: 1 }, // 国旗絵文字は2コードポイントで1グラフィーム
    { s: "a\r\nb", num: 3 }, // CRLFは1グラフィーム
  ];

  test.each(cases)("%o", ({ s, num }) => {
    expect(numGraphemes(s)).toBe(num);
  });
}
