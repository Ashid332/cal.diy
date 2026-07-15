import { describe, expect, it } from "vitest";

import { getOverlappingIntervalWhereClause } from "./prismaIntervalOverlap";

describe("getOverlappingIntervalWhereClause", () => {
  const start = new Date("2026-01-01T10:00:00Z");
  const end = new Date("2026-01-01T11:00:00Z");

  describe("Strict Overlap (default behavior)", () => {
    it("returns strict lt/gt operators for interval intersection", () => {
      const result = getOverlappingIntervalWhereClause(start, end);

      // Verify the helper returns exactly the expected Prisma where clause.
      // Do not perform partial object assertions.
      expect(result).toStrictEqual({
        startTime: {
          lt: end,
        },
        endTime: {
          gt: start,
        },
      });
    });
  });

  describe("Inclusive Overlap", () => {
    it("returns inclusive lte/gte operators when inclusive flag is true", () => {
      const result = getOverlappingIntervalWhereClause(start, end, true);

      expect(result).toStrictEqual({
        startTime: {
          lte: end,
        },
        endTime: {
          gte: start,
        },
      });
    });
  });

  describe("Object Integrity and Reference Isolation", () => {
    it("preserves the original Date objects without mutation or conversion", () => {
      const result = getOverlappingIntervalWhereClause(start, end);

      expect(result.startTime.lt).toBe(end);
      expect(result.endTime.gt).toBe(start);
    });

    it("returns independent objects across multiple invocations without shared state leakage", () => {
      const start1 = new Date("2026-01-01T10:00:00Z");
      const end1 = new Date("2026-01-01T11:00:00Z");

      const start2 = new Date("2026-01-02T10:00:00Z");
      const end2 = new Date("2026-01-02T11:00:00Z");

      const result1 = getOverlappingIntervalWhereClause(start1, end1);
      const result2 = getOverlappingIntervalWhereClause(start2, end2);

      // Verify no shared object references
      expect(result1).not.toBe(result2);
      expect(result1.startTime).not.toBe(result2.startTime);
      expect(result1.endTime).not.toBe(result2.endTime);

      // Verify exact outputs match expectations
      expect(result1).toStrictEqual({
        startTime: { lt: end1 },
        endTime: { gt: start1 },
      });

      expect(result2).toStrictEqual({
        startTime: { lt: end2 },
        endTime: { gt: start2 },
      });
    });
  });

  describe("Input Validation", () => {
    it("throws when startTime equals endTime", () => {
      const sameDate = new Date("2026-01-01T10:00:00Z");
      expect(() => getOverlappingIntervalWhereClause(sameDate, sameDate)).toThrowError(
        "startTime must be earlier than endTime."
      );
    });

    it("throws when startTime is after endTime", () => {
      expect(() => getOverlappingIntervalWhereClause(end, start)).toThrowError(
        "startTime must be earlier than endTime."
      );
    });

    it("throws on invalid start date", () => {
      expect(() => getOverlappingIntervalWhereClause(new Date("invalid"), end)).toThrowError(
        "startTime must be a valid Date."
      );
    });

    it("throws on invalid end date", () => {
      expect(() => getOverlappingIntervalWhereClause(start, new Date("invalid"))).toThrowError(
        "endTime must be a valid Date."
      );
    });
  });
});
