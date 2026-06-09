import type { MicrofrontendMessage, ShellMessage } from "./messages";
import { MICROFRONTEND_MESSAGE_TYPES, SHELL_MESSAGE_TYPES } from "./messages";

export function isMicrofrontendMessage(
  data: unknown
): data is MicrofrontendMessage {
  if (typeof data !== "object" || data === null) return false;
  if (!("type" in data) || typeof (data as Record<string, unknown>).type !== "string") return false;
  const type = (data as Record<string, unknown>).type as string;
  if (!(MICROFRONTEND_MESSAGE_TYPES as readonly string[]).includes(type)) return false;
  if (!("payload" in data) || typeof (data as Record<string, unknown>).payload !== "object") return false;
  if ((data as Record<string, unknown>).payload === null) return false;
  return true;
}

export function isShellMessage(data: unknown): data is ShellMessage {
  if (typeof data !== "object" || data === null) return false;
  if (!("type" in data) || typeof (data as Record<string, unknown>).type !== "string") return false;
  const type = (data as Record<string, unknown>).type as string;
  if (!(SHELL_MESSAGE_TYPES as readonly string[]).includes(type)) return false;
  if (!("payload" in data) || typeof (data as Record<string, unknown>).payload !== "object") return false;
  if ((data as Record<string, unknown>).payload === null) return false;
  return true;
}
