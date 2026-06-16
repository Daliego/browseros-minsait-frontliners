import type { AppReadyMessage, AppId } from "@repo/contracts";
import type { ShellState, ShellAction } from "../../shell-state/types";
import type { Dispatch } from "react";
import { sendToApp } from "../send-to-app";

export function onAppReady(
  message: AppReadyMessage,
  state: ShellState,
  dispatch: Dispatch<ShellAction>,
  getIframe: (appId: AppId) => HTMLIFrameElement | undefined
) {
  const { appId } = message.payload;
  const permissions = state.permissions[appId] ?? [];

  const payload: Parameters<typeof sendToApp>[1]["payload"] = {
    appId,
    user: state.currentUser,
    permissions,
    policy: state.policy,
  };

  if (appId === "deploy-runner-app" && state.pendingDeployId) {
    payload.currentDeployId = state.pendingDeployId;
    dispatch({ type: "SET_PENDING_DEPLOY_ID", payload: { deployId: null } });
  }

  sendToApp(appId, { type: "SET_APP_CONTEXT", payload }, getIframe);
}
