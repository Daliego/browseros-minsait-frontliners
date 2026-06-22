import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeployRunner } from "../hooks/use-deploy-runner";

const FRIDAY_REASON =
  "Deploy na sexta-feira detectado. O BrowserOS bloqueou essa tentativa por motivos de paz coletiva.";

function makeCallbacks() {
  return {
    onDeployStarted: vi.fn(),
    onDeployDone: vi.fn(),
    onDeployRejected: vi.fn(),
  };
}

describe("useDeployRunner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("emits DEPLOY_REJECTED without entering running state when simulateFriday=true", async () => {
    const cbs = makeCallbacks();
    const { result } = renderHook(() =>
      useDeployRunner({
        canDeploy: true,
        policy: { simulateFriday: true },
        deployId: "d-001",
        ...cbs,
      })
    );

    await act(async () => {
      await result.current.startDeploy();
    });

    expect(cbs.onDeployRejected).toHaveBeenCalledWith("d-001", FRIDAY_REASON);
    expect(cbs.onDeployStarted).not.toHaveBeenCalled();
    expect(result.current.status).toBe("rejected");
  });

  it("uses the exact Friday rejection reason string", async () => {
    const cbs = makeCallbacks();
    const { result } = renderHook(() =>
      useDeployRunner({
        canDeploy: true,
        policy: { simulateFriday: true },
        deployId: "d-002",
        ...cbs,
      })
    );

    await act(async () => {
      await result.current.startDeploy();
    });

    const [, reason] = cbs.onDeployRejected.mock.calls[0] as [string, string];
    expect(reason).toBe(FRIDAY_REASON);
  });

  it("does not start when canDeploy=false", async () => {
    const cbs = makeCallbacks();
    const { result } = renderHook(() =>
      useDeployRunner({
        canDeploy: false,
        policy: { simulateFriday: false },
        deployId: null,
        ...cbs,
      })
    );

    await act(async () => {
      await result.current.startDeploy();
    });

    expect(cbs.onDeployStarted).not.toHaveBeenCalled();
    expect(result.current.status).toBe("waiting");
  });

  it("transitions to running then done on happy path", async () => {
    const cbs = makeCallbacks();
    const { result } = renderHook(() =>
      useDeployRunner({
        canDeploy: true,
        policy: { simulateFriday: false },
        deployId: "d-003",
        ...cbs,
      })
    );

    await act(async () => {
      const promise = result.current.startDeploy();
      // Advance past all three 1200ms step delays
      await vi.advanceTimersByTimeAsync(4000);
      await promise;
    });

    expect(cbs.onDeployStarted).toHaveBeenCalledWith("d-003");
    expect(cbs.onDeployDone).toHaveBeenCalledWith("d-003");
    expect(result.current.status).toBe("done");
  });

  it("log area receives at least 3 entries after a successful deploy", async () => {
    const cbs = makeCallbacks();
    const { result } = renderHook(() =>
      useDeployRunner({
        canDeploy: true,
        policy: { simulateFriday: false },
        deployId: "d-004",
        ...cbs,
      })
    );

    await act(async () => {
      const promise = result.current.startDeploy();
      await vi.advanceTimersByTimeAsync(4000);
      await promise;
    });

    expect(result.current.logs.length).toBeGreaterThanOrEqual(3);
  });
});
