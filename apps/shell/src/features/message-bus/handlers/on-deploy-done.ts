import { toast } from "sonner";
import type { DeployDoneMessage, AppId } from "@repo/contracts";
import type { ShellAction } from "../../shell-state/types";
import type { Dispatch } from "react";
import { sendToApp } from "../send-to-app";

export function onDeployDone(
  message: DeployDoneMessage,
  dispatch: Dispatch<ShellAction>,
  getIframe: (appId: AppId) => HTMLIFrameElement | undefined
) {
  const { deployId } = message.payload;

  dispatch({
    type: "UPDATE_DEPLOY_STATUS",
    payload: { deployId, status: "done" },
  });

  toast.success("Deploy concluído", {
    description: `Deploy ${deployId} finalizado com sucesso.`,
  });

  sendToApp(
    "deploy-list-app",
    {
      type: "DEPLOY_STATUS_UPDATED",
      payload: { deployId, status: "done" },
    },
    getIframe
  );
}
