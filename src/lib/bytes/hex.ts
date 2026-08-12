export function toHex(bytes: Uint8Array): string {
  return [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0")) //
    .join("");
}

if (import.meta.vitest) {
  const cases = [
    { bytes: new Uint8Array([]), hex: "" },
    { bytes: new Uint8Array([0]), hex: "00" },
    { bytes: new Uint8Array([0xab, 0xcd]), hex: "abcd" },
    { bytes: new Uint8Array([0x0f, 0x10, 0xff]), hex: "0f10ff" },
  ];

  test.each(cases)("%o", ({ bytes, hex }) => {
    expect(toHex(bytes)).toBe(hex);
  });
}
