export type AppId = "deploy-list-app" | "deploy-runner-app";

export type AppPermission =
  | "deploy:view"
  | "deploy:write"
  | "deploy:execute";

export type DeployStatus = "pending" | "running" | "done" | "rejected";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type OpenedApp = {
  appId: AppId;
  windowId: string;
  openedAt: number;
};

export type ShellPolicy = {
  simulateFriday: boolean;
};
