import { isProd } from "../config/exec-env.ts";

export function clientIp(request: Request): string | null {
  return isProd ? parseClientIp(request.headers) : "1.2.3.4";
}

// TODO: 実際のインフラに合わせて変更する。偽装の可能性も考慮する。
function parseClientIp(headers: Headers): string | null {
  const forwardedFor = headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .at(0);
  const realIp = headers.get("x-real-ip")?.trim();

  return forwardedFor || realIp || null;
}

if (import.meta.vitest) {
  describe("parseClientIp", () => {
    it("returns the lefttmost address of x-forwarded-for", () => {
      const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 9.9.9.9" });
      expect(parseClientIp(headers)).toBe("1.2.3.4");
    });

    it("returns the only address when x-forwarded-for has a single value", () => {
      const headers = new Headers({ "x-forwarded-for": "1.2.3.4" });
      expect(parseClientIp(headers)).toBe("1.2.3.4");
    });

    it("ignores empty segments of x-forwarded-for", () => {
      const headers = new Headers({ "x-forwarded-for": " , 1.2.3.4 , " });
      expect(parseClientIp(headers)).toBe("1.2.3.4");
    });

    it("falls back to x-real-ip when x-forwarded-for is missing", () => {
      const headers = new Headers({ "x-real-ip": "1.2.3.4" });
      expect(parseClientIp(headers)).toBe("1.2.3.4");
    });

    it("prefers x-forwarded-for over x-real-ip", () => {
      const headers = new Headers({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "5.6.7.8" });
      expect(parseClientIp(headers)).toBe("1.2.3.4");
    });

    it("returns null when no address is present", () => {
      expect(parseClientIp(new Headers())).toBeNull();
    });
  });
}
