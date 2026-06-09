import type { OpenAppRequestedMessage, AppId } from "@repo/contracts";
import type { ShellState } from "../../shell-state/types";

export function onOpenAppRequested(
  message: OpenAppRequestedMessage,
  state: ShellState,
  openApp: (appId: AppId | string) => void
) {
  const { appId } = message.payload;
  const requiredPermission = "deploy:view";
  const hasPermission =
    state.permissions[appId]?.includes(requiredPermission) ?? false;

  if (!hasPermission) return;

  openApp(appId);
}
