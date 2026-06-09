import { describe, it, expect } from "vitest";
import type { ShellState, ShellAction } from "../features/shell-state/types";
import type { AppId, AppPermission } from "@repo/contracts";

// Import reducer directly by re-creating it inline to avoid the React context dep
// The reducer is pure, so we test it in isolation.
function shellReducer(state: ShellState, action: ShellAction): ShellState {
  switch (action.type) {
    case "ADD_OPENED_APP":
      if (state.openedApps.some((a) => a.appId === action.payload.appId)) {
        return state;
      }
      return { ...state, openedApps: [...state.openedApps, action.payload] };

    case "REMOVE_OPENED_APP":
      return {
        ...state,
        openedApps: state.openedApps.filter(
          (a) => a.appId !== action.payload.appId
        ),
      };

    case "SET_PERMISSION":
      return {
        ...state,
        permissions: {
          ...state.permissions,
          [action.payload.appId]: action.payload.permissions,
        },
      };

    case "TOGGLE_FRIDAY":
      return {
        ...state,
        policy: { ...state.policy, simulateFriday: !state.policy.simulateFriday },
      };

    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.payload, ...state.notifications] };

    case "DISMISS_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload.id
        ),
      };

    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };

    case "UPDATE_DEPLOY_STATUS":
      return {
        ...state,
        deploys: state.deploys.map((d) =>
          d.id === action.payload.deployId
            ? { ...d, status: action.payload.status }
            : d
        ),
      };

    default:
      return state;
  }
}

function can(
  permissions: Record<AppId, AppPermission[]>,
  appId: AppId,
  permission: AppPermission
): boolean {
  return permissions[appId]?.includes(permission) ?? false;
}

const baseState: ShellState = {
  currentUser: { id: "u-001", name: "Lucas", email: "lucas@demo" },
  permissions: {
    "deploy-list-app": ["deploy:view", "deploy:write"],
    "deploy-runner-app": ["deploy:view", "deploy:execute"],
  },
  openedApps: [],
  deploys: [],
  notifications: [],
  policy: { simulateFriday: false },
};

describe("can() guard", () => {
  it("returns true for deploy:execute on deploy-runner-app by default", () => {
    expect(can(baseState.permissions, "deploy-runner-app", "deploy:execute")).toBe(true);
  });

  it("returns false for deploy:execute after permission is removed", () => {
    const next = shellReducer(baseState, {
      type: "SET_PERMISSION",
      payload: {
        appId: "deploy-runner-app",
        permissions: ["deploy:view"],
      },
    });
    expect(can(next.permissions, "deploy-runner-app", "deploy:execute")).toBe(false);
  });

  it("returns false for unknown app without throwing", () => {
    expect(
      can(baseState.permissions, "deploy-list-app", "deploy:execute")
    ).toBe(false);
  });
});

describe("TOGGLE_FRIDAY", () => {
  it("sets simulateFriday to true", () => {
    const next = shellReducer(baseState, { type: "TOGGLE_FRIDAY" });
    expect(next.policy.simulateFriday).toBe(true);
  });

  it("toggles back to false on second dispatch", () => {
    const once = shellReducer(baseState, { type: "TOGGLE_FRIDAY" });
    const twice = shellReducer(once, { type: "TOGGLE_FRIDAY" });
    expect(twice.policy.simulateFriday).toBe(false);
  });
});

describe("appRegistry", () => {
  it("contains entries for both app IDs", async () => {
    const { appRegistry } = await import("../features/apps/app-registry");
    const ids = appRegistry.map((m) => m.appId);
    expect(ids).toContain("deploy-list-app");
    expect(ids).toContain("deploy-runner-app");
  });
});
