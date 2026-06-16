"use client";

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { AppId, AppPermission, OpenedApp, User } from "@repo/contracts";
import type { ShellState, ShellAction, Deploy, Notification } from "./types";

const DEFAULT_USER: User = {
  id: "u-001",
  name: "Lucas",
  email: "lucas@demo.browseros",
};

const DEFAULT_DEPLOYS: Deploy[] = [
  {
    id: "d-001",
    appName: "api-service",
    environment: "staging",
    owner: "lucas",
    status: "done",
  },
  {
    id: "d-002",
    appName: "frontend",
    environment: "production",
    owner: "mariana",
    status: "pending",
  },
  {
    id: "d-003",
    appName: "worker",
    environment: "staging",
    owner: "carlos",
    status: "running",
  },
];

const INITIAL_STATE: ShellState = {
  currentUser: DEFAULT_USER,
  permissions: {
    "deploy-list-app": ["deploy:view", "deploy:write"],
    "deploy-runner-app": ["deploy:view", "deploy:execute"],
    "portifolio-app": ["*"],
  },
  openedApps: [],
  deploys: DEFAULT_DEPLOYS,
  notifications: [],
  policy: { simulateFriday: false },
};

function shellReducer(state: ShellState, action: ShellAction): ShellState {
  switch (action.type) {
    case "ADD_OPENED_APP":
      if (state.openedApps.some((a) => a.appId === action.payload.appId)) {
        return state;
      }
      return {
        ...state,
        openedApps: [...state.openedApps, action.payload],
      };

    case "REMOVE_OPENED_APP":
      return {
        ...state,
        openedApps: state.openedApps.filter(
          (a) => a.appId !== action.payload.appId
        ),
      };

    case "UPDATE_DEPLOY_STATUS":
      return {
        ...state,
        deploys: state.deploys.map((d) =>
          d.id === action.payload.deployId
            ? { ...d, status: action.payload.status }
            : d
        ),
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case "DISMISS_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload.id
        ),
      };

    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };

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
        policy: {
          ...state.policy,
          simulateFriday: !state.policy.simulateFriday,
        },
      };

    default:
      return state;
  }
}

type ShellContextValue = {
  state: ShellState;
  dispatch: Dispatch<ShellAction>;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shellReducer, INITIAL_STATE);
  return (
    <ShellContext.Provider value={{ state, dispatch }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShellState(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShellState must be used inside ShellProvider");
  return ctx;
}
