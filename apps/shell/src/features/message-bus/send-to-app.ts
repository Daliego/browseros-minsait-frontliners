import type { ShellMessage } from "@repo/contracts";
import type { AppId } from "@repo/contracts";

const APP_ORIGINS: Record<AppId, string> = {
  "deploy-list-app":
    process.env.NEXT_PUBLIC_DEPLOY_LIST_APP_URL ?? "http://localhost:3001",
  "deploy-runner-app":
    process.env.NEXT_PUBLIC_DEPLOY_RUNNER_APP_URL ?? "http://localhost:3002",
};

export function sendToApp(
  appId: AppId,
  message: ShellMessage,
  getIframe: (appId: AppId) => HTMLIFrameElement | undefined
) {
  const iframe = getIframe(appId);
  if (!iframe?.contentWindow) return;
  const origin = APP_ORIGINS[appId] ?? "*";
  iframe.contentWindow.postMessage(message, origin);
}
