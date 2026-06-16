import type {
  AppId,
  AppPermission,
  DeployStatus,
  OpenedApp,
  ShellPolicy,
  User,
} from "@repo/contracts";

export type Deploy = {
  id: string;
  appName: string;
  environment: string;
  owner: string;
  status: DeployStatus;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  variant: "success" | "error" | "info";
  timestamp: number;
};

export type ShellState = {
  currentUser: User;
  permissions: Partial<Record<AppId, AppPermission[]>>;
  openedApps: OpenedApp[];
  deploys: Deploy[];
  notifications: Notification[];
  policy: ShellPolicy;
};

export type ShellAction =
  | { type: "ADD_OPENED_APP"; payload: OpenedApp }
  | { type: "REMOVE_OPENED_APP"; payload: { appId: AppId } }
  | {
      type: "UPDATE_DEPLOY_STATUS";
      payload: { deployId: string; status: DeployStatus };
    }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "DISMISS_NOTIFICATION"; payload: { id: string } }
  | { type: "CLEAR_NOTIFICATIONS" }
  | {
      type: "SET_PERMISSION";
      payload: { appId: AppId; permissions: AppPermission[] };
    }
  | { type: "TOGGLE_FRIDAY" };
