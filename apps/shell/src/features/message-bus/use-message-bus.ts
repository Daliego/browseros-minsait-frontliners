"use client";

import { useEffect, useRef } from "react";
import type { AppId } from "@repo/contracts";
import { useShellState } from "../shell-state/shell-context";
import { createMessageHandler } from "./shell-message-bus";

export function useMessageBus(
  openApp: (appId: AppId | string) => void,
  getIframe: (appId: AppId) => HTMLIFrameElement | undefined
) {
  const { state, dispatch } = useShellState();

  // Use a ref to always read fresh state inside the message handler
  // without re-registering the listener on every state change
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const handler = createMessageHandler(
      () => stateRef.current,
      dispatch,
      openApp,
      getIframe
    );
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [dispatch, openApp, getIframe]);
}
