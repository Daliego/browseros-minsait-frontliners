import { isMicrofrontendMessage } from "@repo/contracts";
import type { AppId } from "@repo/contracts";
import type { ShellState, ShellAction } from "../shell-state/types";
import type { Dispatch } from "react";
import { onAppReady } from "./handlers/on-app-ready";
import { onOpenAppRequested } from "./handlers/on-open-app-requested";
import { onPushNotification } from "./handlers/on-push-notification";
import { onDeployStarted } from "./handlers/on-deploy-started";
import { onDeployDone } from "./handlers/on-deploy-done";
import { onDeployRejected } from "./handlers/on-deploy-rejected";

const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_DEPLOY_LIST_APP_URL ?? "http://localhost:3001",
  process.env.NEXT_PUBLIC_DEPLOY_RUNNER_APP_URL ?? "http://localhost:3002",
]);

export function createMessageHandler(
  getState: () => ShellState,
  dispatch: Dispatch<ShellAction>,
  
  openApp: (appId: AppId | string) => void,
  getIframe: (appId: AppId) => HTMLIFrameElement | undefined
) {
  return function handleMessage(event: MessageEvent) {
    if (!ALLOWED_ORIGINS.has(event.origin)) return;
    if (!isMicrofrontendMessage(event.data)) return;

    const msg = event.data;
    const state = getState();

    switch (msg.type) {
      case "APP_READY":
        onAppReady(msg, state, dispatch, getIframe);
        break;
      case "OPEN_APP_REQUESTED":
        onOpenAppRequested(msg, state, openApp, dispatch);
        break;
      case "PUSH_NOTIFICATION":
        onPushNotification(msg, dispatch);
        break;
      case "DEPLOY_STARTED":
        onDeployStarted(msg, dispatch, getIframe);
        break;
      case "DEPLOY_DONE":
        onDeployDone(msg, dispatch, getIframe);
        break;
      case "DEPLOY_REJECTED":
        onDeployRejected(msg, dispatch, getIframe);
        break;
    }
  };
}
