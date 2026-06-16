import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMessageHandler } from "../features/message-bus/shell-message-bus";
import type { ShellState } from "../features/shell-state/types";
import type { AppId, AppPermission } from "@repo/contracts";

function makeState(overrides?: Partial<ShellState>): ShellState {
  return {
    currentUser: { id: "u1", name: "Lucas", email: "lucas@demo" },
    permissions: {
      "deploy-list-app": ["deploy:view", "deploy:write"],
      "deploy-runner-app": ["deploy:view", "deploy:execute"],
      "portifolio-app": ["*"],
    },
    openedApps: [],
    deploys: [
      {
        id: "d-001",
        appName: "api",
        environment: "staging",
        owner: "lucas",
        status: "pending",
      },
    ],
    notifications: [],
    policy: { simulateFriday: false },
    ...overrides,
  };
}

const ALLOWED_ORIGIN = "http://localhost:3001";
const RUNNER_ORIGIN = "http://localhost:3002";

describe("createMessageHandler", () => {
  let dispatch: ReturnType<typeof vi.fn>;
  let openApp: ReturnType<typeof vi.fn>;
  let getIframe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dispatch = vi.fn();
    openApp = vi.fn();
    getIframe = vi.fn().mockReturnValue(undefined);
    vi.resetAllMocks();
  });

  it("ignores messages from unknown origins", () => {
    const state = makeState();
    const handler = createMessageHandler(
      () => state,
      dispatch,
      openApp,
      getIframe
    );
    handler(new MessageEvent("message", {
      origin: "http://malicious.com",
      data: { type: "APP_READY", payload: { appId: "deploy-list-app" } },
    }));
    expect(dispatch).not.toHaveBeenCalled();
    expect(openApp).not.toHaveBeenCalled();
  });

  it("ignores messages that fail isMicrofrontendMessage guard", () => {
    const state = makeState();
    const handler = createMessageHandler(
      () => state,
      dispatch,
      openApp,
      getIframe
    );
    handler(new MessageEvent("message", {
      origin: ALLOWED_ORIGIN,
      data: { type: "UNKNOWN_EVENT", payload: {} },
    }));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("APP_READY calls sendToApp via getIframe lookup", () => {
    const mockIframe = { contentWindow: { postMessage: vi.fn() } };
    getIframe = vi.fn().mockReturnValue(mockIframe);
    const state = makeState();
    const handler = createMessageHandler(
      () => state,
      dispatch,
      openApp,
      getIframe as unknown as (appId: AppId) => HTMLIFrameElement | undefined
    );
    handler(new MessageEvent("message", {
      origin: ALLOWED_ORIGIN,
      data: {
        type: "APP_READY",
        payload: { appId: "deploy-list-app" },
      },
    }));
    expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SET_APP_CONTEXT",
        payload: expect.objectContaining({
          appId: "deploy-list-app",
          permissions: expect.arrayContaining(["deploy:view"] as AppPermission[]),
        }),
      }),
      expect.any(String)
    );
  });

  it("DEPLOY_DONE dispatches UPDATE_DEPLOY_STATUS and sends DEPLOY_STATUS_UPDATED", () => {
    const mockIframe = { contentWindow: { postMessage: vi.fn() } };
    getIframe = vi.fn().mockReturnValue(mockIframe);
    const state = makeState();
    const handler = createMessageHandler(
      () => state,
      dispatch,
      openApp,
      getIframe as unknown as (appId: AppId) => HTMLIFrameElement | undefined
    );
    handler(new MessageEvent("message", {
      origin: RUNNER_ORIGIN,
      data: { type: "DEPLOY_DONE", payload: { deployId: "d-001" } },
    }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "UPDATE_DEPLOY_STATUS",
      payload: { deployId: "d-001", status: "done" },
    });
    expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "DEPLOY_STATUS_UPDATED",
        payload: { deployId: "d-001", status: "done" },
      }),
      expect.any(String)
    );
  });

  it("OPEN_APP_REQUESTED for app without deploy:view does not call openApp", () => {
    const state = makeState({
      permissions: {
        "deploy-list-app": [],
        "deploy-runner-app": [],
        "portifolio-app": ["*"],
      },
    });
    const handler = createMessageHandler(
      () => state,
      dispatch,
      openApp,
      getIframe
    );
    handler(new MessageEvent("message", {
      origin: ALLOWED_ORIGIN,
      data: {
        type: "OPEN_APP_REQUESTED",
        payload: { appId: "deploy-runner-app" },
      },
    }));
    expect(openApp).not.toHaveBeenCalled();
  });
});
