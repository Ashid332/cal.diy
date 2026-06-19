import { prisma } from "@calcom/prisma/__mocks__/prisma";
import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";

import { addNotificationsSubscriptionHandler } from "./addNotificationsSubscription.handler";

vi.mock("@calcom/prisma", () => ({
  default: prisma,
  prisma,
}));

vi.mock("@calcom/features/notifications/sendNotification", () => ({
  sendNotification: vi.fn(),
}));

vi.mock("@calcom/lib/constants", () => ({
  WEBAPP_URL: "https://selfhosted.cal.local",
}));

describe("addNotificationsSubscription.handler", () => {
  const mockUser = { id: 1 };
  
  it("Should throw TRPC BAD_REQUEST when given invalid JSON", async () => {
    await expect(
      addNotificationsSubscriptionHandler({
        ctx: { user: mockUser as any },
        input: { subscription: "invalid-json" }
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "BAD_REQUEST",
        message: "Malformed subscription JSON",
      })
    );
  });

  it("Should throw TRPC BAD_REQUEST when given invalid subscription structure", async () => {
    await expect(
      addNotificationsSubscriptionHandler({
        ctx: { user: mockUser as any },
        input: { subscription: JSON.stringify({ endpoint: "not-a-url" }) }
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid subscription",
      })
    );
  });

  it("Should use WEBAPP_URL for self-hosted notification URL", async () => {
    const mockSubscription = {
      endpoint: "https://push.example.com",
      keys: { auth: "auth", p256dh: "p256dh" }
    };
    
    prisma.notificationsSubscriptions.findFirst.mockResolvedValue(null);

    const { sendNotification } = await import("@calcom/features/notifications/sendNotification");

    const response = await addNotificationsSubscriptionHandler({
      ctx: { user: mockUser as any },
      input: { subscription: JSON.stringify(mockSubscription) }
    });

    expect(response).toEqual({ message: "Subscription added successfully" });
    expect(sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://selfhosted.cal.local",
        type: "TEST_NOTIFICATION"
      })
    );
  });
});
