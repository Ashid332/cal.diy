import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { useSlotReservationId } from "./useSlotReservationId";

describe("useSlotReservationId", () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Clear the module level variable by setting it to null
    const [, set] = useSlotReservationId();
    set(null as unknown as string);
    sessionStorage.clear(); // Because set(null) wrote "null" string to sessionStorage
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return null initially if sessionStorage is empty", () => {
    const [get] = useSlotReservationId();
    expect(get()).toBeNull();
  });

  it("should persist slot reservation id to sessionStorage", () => {
    const [get, set] = useSlotReservationId();
    set("test-uid-123");
    
    expect(get()).toBe("test-uid-123");
    expect(sessionStorage.getItem("slotReservationId")).toBe("test-uid-123");
  });

  it("should retrieve slot reservation id from sessionStorage on initialization", () => {
    sessionStorage.setItem("slotReservationId", "test-uid-456");
    
    const [get] = useSlotReservationId();
    expect(get()).toBe("test-uid-456");
  });

  it("should not crash if sessionStorage throws an error (e.g. in incognito iframe)", () => {
    // Mock sessionStorage to throw errors to simulate partitioned storage security errors
    const setItemMock = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const getItemMock = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    const [get, set] = useSlotReservationId();
    
    // Should not throw
    expect(() => set("test-uid-789")).not.toThrow();
    
    // Memory fallback should still work within the same session
    expect(get()).toBe("test-uid-789");

    setItemMock.mockRestore();
    getItemMock.mockRestore();
  });
});
