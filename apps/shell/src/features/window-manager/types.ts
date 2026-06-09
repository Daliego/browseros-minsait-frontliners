import type WinBox from "winbox";
import type { AppId } from "@repo/contracts";

export type OpenedAppEntry = {
  appId: AppId;
  windowId: string;
  iframe: HTMLIFrameElement;
  winbox: WinBox;
  openedAt: number;
};
