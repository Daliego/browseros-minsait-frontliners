import type { AppManifest, AppId } from "@repo/contracts";
import type { OpenedAppEntry } from "./types";
import type { ShellAction } from "../shell-state/types";
import type { Dispatch } from "react";
import { MapPinOffIcon } from "lucide-react";

export async function openAppWindow(
  manifest: AppManifest,
  currentEntries: OpenedAppEntry[],
  dispatch: Dispatch<ShellAction>,
  onEntryCreated: (entry: OpenedAppEntry) => void, 
  onEntryClosed: (appId: AppId) => void
): Promise<void> {
  // Dedup: focus existing window if already open
  const existing = currentEntries.find((e) => e.appId === manifest.appId);
  if (existing) {
    console.log('focus window', existing)
    existing.winbox.focus();
    return;
  }



  await import("winbox");
  // The browser field in winbox's package.json resolves to dist/winbox.bundle.min.js,
  // an IIFE that sets window.WinBox instead of exporting a default. Read the global directly.
  const WinBox = (window as unknown as { WinBox: typeof import("winbox").default }).WinBox;
  const iframe = document.createElement("iframe");
  iframe.src = manifest.url;
  iframe.style.cssText =
    "width:100%;height:100%;border:none;background:#0a0a0a;";

  const windowId = `${manifest.appId}-${Date.now()}`;
  const offset = currentEntries.length * 30;

  const entry: Partial<OpenedAppEntry> = {
    appId: manifest.appId,
    windowId,
    iframe,
    openedAt: Date.now(),
  };

  const wb = new WinBox(manifest.name, {
    width: manifest.defaultWindowSize.width,
    height: manifest.defaultWindowSize.height,
    x: 160 + offset,
    y: 60 + offset,
    mount: iframe,
    onclose: () => {
      dispatch({
        type: "REMOVE_OPENED_APP",
        payload: { appId: manifest.appId },
      });

      onEntryClosed(manifest.appId)

      return false;
    },
  });

  entry.winbox = wb;

  dispatch({
    type: "ADD_OPENED_APP",
    payload: {
      appId: manifest.appId,
      windowId,
      openedAt: entry.openedAt!,
    },
  });

  onEntryCreated(entry as OpenedAppEntry);
}

export function closeAppWindow(
  appId: AppId,
  entries: OpenedAppEntry[],
  dispatch: Dispatch<ShellAction>
) {
  const entry = entries.find((e) => e.appId === appId);
  if (!entry) return;
  entry.winbox.close(true);
  dispatch({ type: "REMOVE_OPENED_APP", payload: { appId } });
}

export function getIframeForApp(
  appId: AppId,
  entries: OpenedAppEntry[]
): HTMLIFrameElement | undefined {
  return entries.find((e) => e.appId === appId)?.iframe;
}
