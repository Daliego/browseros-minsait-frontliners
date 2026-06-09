import { toast } from "sonner";
import type { PushNotificationMessage } from "@repo/contracts";
import type { ShellAction, Notification } from "../../shell-state/types";
import type { Dispatch } from "react";

export function onPushNotification(
  message: PushNotificationMessage,
  dispatch: Dispatch<ShellAction>
) {
  const { title, message: body, variant } = message.payload;

  switch (variant) {
    case "success":
      toast.success(title, { description: body });
      break;
    case "error":
      toast.error(title, { description: body });
      break;
    default:
      toast.info(title, { description: body });
  }

  const notification: Notification = {
    id: crypto.randomUUID(),
    title,
    message: body,
    variant,
    timestamp: Date.now(),
  };

  dispatch({ type: "ADD_NOTIFICATION", payload: notification });
}
