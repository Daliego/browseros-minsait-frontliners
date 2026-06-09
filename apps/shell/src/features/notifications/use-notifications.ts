import { useShellState } from "../shell-state/shell-context";
import type { Notification } from "../shell-state/types";

export function useNotifications() {
  const { state, dispatch } = useShellState();

  function addNotification(notification: Omit<Notification, "id" | "timestamp">) {
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      },
    });
  }

  function dismissNotification(id: string) {
    dispatch({ type: "DISMISS_NOTIFICATION", payload: { id } });
  }

  function clearAll() {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  }

  return {
    notifications: state.notifications,
    addNotification,
    dismissNotification,
    clearAll,
  };
}
