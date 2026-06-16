"use client";

import { useEffect, useState } from "react";
import { isShellMessage } from "@repo/contracts";
import type { AppPermission, ShellPolicy, User } from "@repo/contracts";

export type ShellContext = {
  user: User | null;
  permissions: AppPermission[];
  policy: ShellPolicy;
  currentDeployId: string | null;
};

const INITIAL_CONTEXT: ShellContext = {
  user: null,
  permissions: [],
  policy: { simulateFriday: false },
  currentDeployId: null,
};

function postToShell(message: unknown) {
  window.parent.postMessage(message, "*");
}

export function useShellBridge() {
  const [shellContext, setShellContext] = useState<ShellContext>(INITIAL_CONTEXT);

  useEffect(() => {
    postToShell({ type: "APP_READY", payload: { appId: "deploy-runner-app" } });

    function handleMessage(event: MessageEvent) {
      if (!isShellMessage(event.data)) return;
      const msg = event.data;
      if (msg.type === "SET_APP_CONTEXT") {
        setShellContext({
          user: msg.payload.user,
          permissions: msg.payload.permissions,
          policy: msg.payload.policy,
          currentDeployId: msg.payload.currentDeployId ?? null,
        });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return { shellContext, postToShell };
}
