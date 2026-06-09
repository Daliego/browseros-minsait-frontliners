import type { AppId, AppPermission, DeployStatus, ShellPolicy, User } from "./types";

// ── Messages sent from microfrontends → shell ────────────────────────────────

export type AppReadyMessage = {
  type: "APP_READY";
  payload: { appId: AppId };
};

export type OpenAppRequestedMessage = {
  type: "OPEN_APP_REQUESTED";
  payload: { appId: AppId; params?: Record<string, string> };
};

export type PushNotificationMessage = {
  type: "PUSH_NOTIFICATION";
  payload: {
    title: string;
    message: string;
    variant: "success" | "error" | "info";
  };
};

export type DeployStartedMessage = {
  type: "DEPLOY_STARTED";
  payload: { deployId: string };
};

export type DeployDoneMessage = {
  type: "DEPLOY_DONE";
  payload: { deployId: string };
};

export type DeployRejectedMessage = {
  type: "DEPLOY_REJECTED";
  payload: { deployId: string; reason: string };
};

export type MicrofrontendMessage =
  | AppReadyMessage
  | OpenAppRequestedMessage
  | PushNotificationMessage
  | DeployStartedMessage
  | DeployDoneMessage
  | DeployRejectedMessage;

// ── Messages sent from shell → microfrontends ────────────────────────────────

export type SetAppContextMessage = {
  type: "SET_APP_CONTEXT";
  payload: {
    appId: AppId;
    user: User;
    permissions: AppPermission[];
    policy: ShellPolicy;
    currentDeployId?: string;
  };
};

export type DeployStatusUpdatedMessage = {
  type: "DEPLOY_STATUS_UPDATED";
  payload: { deployId: string; status: DeployStatus };
};

export type ShellMessage = SetAppContextMessage | DeployStatusUpdatedMessage;

// ── Union of all known message types ─────────────────────────────────────────

export type AnyMessage = MicrofrontendMessage | ShellMessage;

// ── Message type string constants ─────────────────────────────────────────────

export const MICROFRONTEND_MESSAGE_TYPES = [
  "APP_READY",
  "OPEN_APP_REQUESTED",
  "PUSH_NOTIFICATION",
  "DEPLOY_STARTED",
  "DEPLOY_DONE",
  "DEPLOY_REJECTED",
] as const;

export const SHELL_MESSAGE_TYPES = [
  "SET_APP_CONTEXT",
  "DEPLOY_STATUS_UPDATED",
] as const;
