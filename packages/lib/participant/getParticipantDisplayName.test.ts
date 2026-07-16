import { describe, expect, it } from "vitest";

import { getParticipantDisplayName } from "./getParticipantDisplayName";

describe("getParticipantDisplayName", () => {
  it("returns the name when provided", () => {
    expect(getParticipantDisplayName("John Doe", "fallback@example.com")).toBe("John Doe");
  });

  it("returns the fallback when name is null", () => {
    expect(getParticipantDisplayName(null, "fallback@example.com")).toBe("fallback@example.com");
  });

  it("returns the fallback when name is undefined", () => {
    expect(getParticipantDisplayName(undefined, "fallback@example.com")).toBe("fallback@example.com");
  });

  it("returns the fallback when name is an empty string", () => {
    expect(getParticipantDisplayName("", "fallback@example.com")).toBe("fallback@example.com");
  });
});
