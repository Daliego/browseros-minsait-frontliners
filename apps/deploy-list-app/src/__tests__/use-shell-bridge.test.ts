import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useShellBridge } from "../hooks/use-shell-bridge";

function dispatchShellMessage(data: unknown) {
  window.dispatchEvent(new MessageEvent("message", { data }));
}

describe("useShellBridge (deploy-list-app)", () => {
  beforeEach(() => {
    vi.spyOn(window.parent, "postMessage");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends APP_READY on mount", () => {
    renderHook(() => useShellBridge());
    expect(window.parent.postMessage).toHaveBeenCalledWith(
      { type: "APP_READY", payload: { appId: "deploy-list-app" } },
      "*"
    );
  });

  it("updates deploy row status when DEPLOY_STATUS_UPDATED is received", () => {
    const { result } = renderHook(() => useShellBridge());

    act(() => {
      dispatchShellMessage({
        type: "DEPLOY_STATUS_UPDATED",
        payload: { deployId: "d-001", status: "done" },
      });
    });

    const updated = result.current.deploys.find((d) => d.id === "d-001");
    expect(updated?.status).toBe("done");
  });

  it("does not throw and does not mutate other rows when deployId is unknown", () => {
    const { result } = renderHook(() => useShellBridge());
    const before = result.current.deploys.map((d) => d.status);

    act(() => {
      dispatchShellMessage({
        type: "DEPLOY_STATUS_UPDATED",
        payload: { deployId: "d-UNKNOWN", status: "done" },
      });
    });

    const after = result.current.deploys.map((d) => d.status);
    expect(after).toEqual(before);
  });

  it("sends OPEN_APP_REQUESTED with deploy-runner-app when requestNewDeploy is called", () => {
    const { result } = renderHook(() => useShellBridge());
    vi.clearAllMocks();

    act(() => {
      result.current.requestNewDeploy("d-042");
    });

    expect(window.parent.postMessage).toHaveBeenCalledWith(
      {
        type: "OPEN_APP_REQUESTED",
        payload: { appId: "deploy-runner-app", params: { deployId: "d-042" } },
      },
      "*"
    );
  });
});
