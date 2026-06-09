import type { AppReadyMessage, AppId } from "@repo/contracts";
import type { ShellState } from "../../shell-state/types";
import type { ShellAction } from "../../shell-state/types";
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

  sendToApp(
    appId,
    {
      type: "SET_APP_CONTEXT",
      payload: {
        appId,
        user: state.currentUser,
        permissions,
        policy: state.policy,
      },
    },
    getIframe
  );
}
