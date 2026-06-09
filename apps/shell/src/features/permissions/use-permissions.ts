import type { AppId, AppPermission } from "@repo/contracts";
import { useShellState } from "../shell-state/shell-context";

export function usePermissions() {
  const { state, dispatch } = useShellState();

  function can(appId: AppId, permission: AppPermission): boolean {
    return state.permissions[appId]?.includes(permission) ?? false;
  }

  function revokePermission(appId: AppId, permission: AppPermission) {
    const current = state.permissions[appId] ?? [];
    dispatch({
      type: "SET_PERMISSION",
      payload: {
        appId,
        permissions: current.filter((p) => p !== permission),
      },
    });
  }

  function grantPermission(appId: AppId, permission: AppPermission) {
    const current = state.permissions[appId] ?? [];
    if (current.includes(permission)) return;
    dispatch({
      type: "SET_PERMISSION",
      payload: { appId, permissions: [...current, permission] },
    });
  }

  return { can, revokePermission, grantPermission, permissions: state.permissions };
}
