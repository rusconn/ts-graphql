import type { CostExtensions } from "../presentation/graphql/schema/_errors/global/rate-limited.ts";

export function buildCostExtensions(input: {
  requestedQueryCost: number;
  capacity: number;
  currentlyAvailable: number;
  refillPerSecond: number;
}): CostExtensions {
  const { requestedQueryCost, capacity, currentlyAvailable, refillPerSecond } = input;
  return {
    requestedQueryCost,
    throttleStatus: {
      maximumAvailable: capacity,
      currentlyAvailable: Math.floor(currentlyAvailable),
      restoreRate: refillPerSecond,
    },
  };
}

if (import.meta.vitest) {
  describe("buildCostExtensions", () => {
    it("reports the requested cost and the bucket state", () => {
      expect(
        buildCostExtensions({
          requestedQueryCost: 100,
          capacity: 10000,
          currentlyAvailable: 9948.5,
          refillPerSecond: 200,
        }),
      ).toEqual({
        requestedQueryCost: 100,
        throttleStatus: {
          maximumAvailable: 10000,
          currentlyAvailable: 9948,
          restoreRate: 200,
        },
      });
    });

    it("floors the balance that cannot cover a whole unit of cost", () => {
      expect(
        buildCostExtensions({
          requestedQueryCost: 2,
          capacity: 10000,
          currentlyAvailable: 1.999,
          refillPerSecond: 200,
        }).throttleStatus.currentlyAvailable,
      ).toBe(1);
    });

    it("keeps the real balance when the bucket is insufficient", () => {
      expect(
        buildCostExtensions({
          requestedQueryCost: 100,
          capacity: 10000,
          currentlyAvailable: 42,
          refillPerSecond: 200,
        }).throttleStatus.currentlyAvailable,
      ).toBe(42);
    });
  });
}
