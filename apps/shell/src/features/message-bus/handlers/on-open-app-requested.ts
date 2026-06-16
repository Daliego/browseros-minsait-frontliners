import type { OpenAppRequestedMessage, AppId } from "@repo/contracts";
import type { ShellState, ShellAction } from "../../shell-state/types";
import type { Dispatch } from "react";

export function onOpenAppRequested(
  message: OpenAppRequestedMessage,
  state: ShellState,
  openApp: (appId: AppId | string) => void,
  dispatch: Dispatch<ShellAction>
) {
  const { appId, params } = message.payload;
  const requiredPermission = "deploy:view";
  const hasPermission =
    state.permissions[appId]?.includes(requiredPermission) ?? false;

  if (!hasPermission) return;

  if (params?.deployId) {
    dispatch({ type: "SET_PENDING_DEPLOY_ID", payload: { deployId: params.deployId } });
  }

  openApp(appId);
}
