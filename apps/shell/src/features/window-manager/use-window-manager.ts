"use client";

import { useRef, useCallback } from "react";
import type { AppManifest, AppId } from "@repo/contracts";
import type { OpenedAppEntry } from "./types";
import { openAppWindow, closeAppWindow, getIframeForApp } from "./window-manager";
import { useShellState } from "../shell-state/shell-context";
import { appRegistry } from "../apps/app-registry";

export function useWindowManager() {
  const { state, dispatch } = useShellState();
  const entriesRef = useRef<OpenedAppEntry[]>([]);

  const openApp = useCallback(
    (appId: AppId | string) => {
      const manifest = appRegistry.find((m) => m.appId === appId);
      if (!manifest) return;
      openAppWindow(
        manifest,
        entriesRef.current,
        dispatch,
        (entry) => {
          entriesRef.current = [...entriesRef.current, entry];
        }
      );
    },
    [dispatch]
  );

  const closeApp = useCallback(
    (appId: AppId | string) => {
      closeAppWindow(appId as AppId, entriesRef.current, dispatch);
      entriesRef.current = entriesRef.current.filter((e) => e.appId !== appId);
    },
    [dispatch]
  );

  const getIframe = useCallback((appId: AppId | string) => {
    return getIframeForApp(appId as AppId, entriesRef.current);
  }, []);

  return {
    openApp,
    closeApp,
    getIframe,
    openedApps: state.openedApps,
  };
}
