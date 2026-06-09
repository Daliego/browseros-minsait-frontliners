import { toast } from "sonner";
import type { DeployRejectedMessage, AppId } from "@repo/contracts";
import type { ShellAction } from "../../shell-state/types";
import type { Dispatch } from "react";
import { sendToApp } from "../send-to-app";

export function onDeployRejected(
  message: DeployRejectedMessage,
  dispatch: Dispatch<ShellAction>,
  getIframe: (appId: AppId) => HTMLIFrameElement | undefined
) {
  const { deployId, reason } = message.payload;

  dispatch({
    type: "UPDATE_DEPLOY_STATUS",
    payload: { deployId, status: "rejected" },
  });

  toast.error("Deploy bloqueado", { description: reason });

  sendToApp(
    "deploy-list-app",
    {
      type: "DEPLOY_STATUS_UPDATED",
      payload: { deployId, status: "rejected" },
    },
    getIframe
  );
}
