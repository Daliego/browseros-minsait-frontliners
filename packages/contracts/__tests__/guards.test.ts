import { describe, expect, it } from "vitest";
import { isMicrofrontendMessage, isShellMessage } from "../src/guards";

describe("isMicrofrontendMessage", () => {
  it("returns true for a valid APP_READY message", () => {
    expect(
      isMicrofrontendMessage({ type: "APP_READY", payload: { appId: "deploy-list-app" } })
    ).toBe(true);
  });

  it("returns false for an unknown event type", () => {
    expect(
      isMicrofrontendMessage({ type: "UNKNOWN_EVENT", payload: {} })
    ).toBe(false);
  });

  it("returns false for null without throwing", () => {
    expect(isMicrofrontendMessage(null)).toBe(false);
  });

  it("returns false when payload is missing", () => {
    expect(isMicrofrontendMessage({ type: "APP_READY" })).toBe(false);
  });

  it("returns false for a non-object value", () => {
    expect(isMicrofrontendMessage("APP_READY")).toBe(false);
    expect(isMicrofrontendMessage(42)).toBe(false);
    expect(isMicrofrontendMessage(undefined)).toBe(false);
  });

  it("returns true for OPEN_APP_REQUESTED", () => {
    expect(
      isMicrofrontendMessage({
        type: "OPEN_APP_REQUESTED",
        payload: { appId: "deploy-runner-app" },
      })
    ).toBe(true);
  });

  it("returns true for DEPLOY_REJECTED", () => {
    expect(
      isMicrofrontendMessage({
        type: "DEPLOY_REJECTED",
        payload: { deployId: "d-001", reason: "Friday block" },
      })
    ).toBe(true);
  });

  it("returns false when payload is null", () => {
    expect(isMicrofrontendMessage({ type: "APP_READY", payload: null })).toBe(false);
  });
});

describe("isShellMessage", () => {
  it("returns true for a valid SET_APP_CONTEXT message", () => {
    expect(
      isShellMessage({
        type: "SET_APP_CONTEXT",
        payload: {
          appId: "deploy-runner-app",
          user: { id: "u1", name: "Alice", email: "alice@example.com" },
          permissions: ["deploy:execute"],
          policy: { simulateFriday: false },
        },
      })
    ).toBe(true);
  });

  it("returns true for a valid DEPLOY_STATUS_UPDATED message", () => {
    expect(
      isShellMessage({
        type: "DEPLOY_STATUS_UPDATED",
        payload: { deployId: "d-001", status: "done" },
      })
    ).toBe(true);
  });

  it("returns false for a microfrontend message type", () => {
    expect(
      isShellMessage({ type: "APP_READY", payload: { appId: "deploy-list-app" } })
    ).toBe(false);
  });

  it("returns false for null", () => {
    expect(isShellMessage(null)).toBe(false);
  });

  it("returns false when payload is missing", () => {
    expect(isShellMessage({ type: "SET_APP_CONTEXT" })).toBe(false);
  });
});
