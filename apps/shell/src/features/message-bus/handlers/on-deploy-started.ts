import { toast } from "sonner";
import type { DeployStartedMessage, AppId } from "@repo/contracts";
import type { ShellAction } from "../../shell-state/types";
import type { Dispatch } from "react";
import { sendToApp } from "../send-to-app";

export function onDeployStarted(
  message: DeployStartedMessage,
  dispatch: Dispatch<ShellAction>,
  getIframe: (appId: AppId) => HTMLIFrameElement | undefined
) {
  const { deployId } = message.payload;

  dispatch({
    type: "UPDATE_DEPLOY_STATUS",
    payload: { deployId, status: "running" },
  });

  toast.info("Deploy iniciado", {
    description: `Deploy ${deployId} está em execução.`,
  });

  sendToApp(
    "deploy-list-app",
    {
      type: "DEPLOY_STATUS_UPDATED",
      payload: { deployId, status: "running" },
    },
    getIframe
  );
}
