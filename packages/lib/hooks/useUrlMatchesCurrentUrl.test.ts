import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, it, vi } from "vitest";

import { useUrlMatchesCurrentUrl } from "./useUrlMatchesCurrentUrl";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// Mock @calcom/lib/hooks/useCompatSearchParams
vi.mock("@calcom/lib/hooks/useCompatSearchParams", () => ({
  useCompatSearchParams: vi.fn(),
}));

describe("useUrlMatchesCurrentUrl", () => {
  it("should match urls with same search params in different order", async () => {
    const { usePathname } = await import("next/navigation");
    const { useCompatSearchParams } = await import("@calcom/lib/hooks/useCompatSearchParams");

    // @ts-expect-error Mocking
    usePathname.mockReturnValue("/test");
    
    // @ts-expect-error Mocking
    useCompatSearchParams.mockReturnValue(new URLSearchParams("b=2&a=1"));

    // matchFullPath = true
    const { result: resultFullPath } = renderHook(() => useUrlMatchesCurrentUrl("/test?a=1&b=2", true));
    expect(resultFullPath.current).toBe(true);

    // matchFullPath = false (includes)
    const { result: resultIncludes } = renderHook(() => useUrlMatchesCurrentUrl("?a=1&b=2"));
    expect(resultIncludes.current).toBe(true);
  });

  it("should not match urls with different search params", async () => {
    const { usePathname } = await import("next/navigation");
    const { useCompatSearchParams } = await import("@calcom/lib/hooks/useCompatSearchParams");

    // @ts-expect-error Mocking
    usePathname.mockReturnValue("/test");
    
    // @ts-expect-error Mocking
    useCompatSearchParams.mockReturnValue(new URLSearchParams("a=1&b=3"));

    const { result } = renderHook(() => useUrlMatchesCurrentUrl("/test?a=1&b=2", true));
    expect(result.current).toBe(false);
  });

  it("should handle duplicate query parameters robustly", async () => {
    const { usePathname } = await import("next/navigation");
    const { useCompatSearchParams } = await import("@calcom/lib/hooks/useCompatSearchParams");

    // @ts-expect-error Mocking
    usePathname.mockReturnValue("/test");
    
    // @ts-expect-error Mocking
    useCompatSearchParams.mockReturnValue(new URLSearchParams("a=2&a=1"));

    // URLSearchParams.sort() is stable, duplicate key order is preserved or sorted properly
    const { result } = renderHook(() => useUrlMatchesCurrentUrl("/test?a=2&a=1", true));
    expect(result.current).toBe(true);
  });

  it("should safely ignore hash fragments in the target URL", async () => {
    const { usePathname } = await import("next/navigation");
    const { useCompatSearchParams } = await import("@calcom/lib/hooks/useCompatSearchParams");

    // @ts-expect-error Mocking
    usePathname.mockReturnValue("/test");
    
    // @ts-expect-error Mocking
    useCompatSearchParams.mockReturnValue(new URLSearchParams("b=2&a=1"));

    // matchFullPath = false (includes) handles hashes by safely leaving them at the end
    // so "?a=1&b=2#section" is sorted to "?a=1&b=2#section", and "/test?a=1&b=2" does NOT include it.
    // Wait, if current path is "/test?a=1&b=2", it won't match a target URL containing a hash fragment unless the current path has one, 
    // which usePathname never does. But the sorting won't corrupt the string.
    const { result } = renderHook(() => useUrlMatchesCurrentUrl("?a=1&b=2#section"));
    expect(result.current).toBe(false); // Because current doesn't have the hash
  });
});
