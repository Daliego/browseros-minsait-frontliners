"use client";

import { useEffect, useState, useCallback } from "react";
import { isShellMessage } from "@repo/contracts";
import type { AppPermission, DeployStatus, ShellPolicy, User } from "@repo/contracts";
import type { Deploy } from "../data/mock-deploys";
import { mockDeploys } from "../data/mock-deploys";

type ShellContext = {
  user: User | null;
  permissions: AppPermission[];
  policy: ShellPolicy;
};

type UseShellBridgeReturn = {
  deploys: Deploy[];
  shellContext: ShellContext;
  requestNewDeploy: (deployId: string) => void;
};

const SHELL_ORIGIN = typeof window !== "undefined" ? window.location.origin : "*";

function postToShell(message: unknown) {
  window.parent.postMessage(message, "*");
}

export function useShellBridge(): UseShellBridgeReturn {
  const [deploys, setDeploys] = useState<Deploy[]>(mockDeploys);
  const [shellContext, setShellContext] = useState<ShellContext>({
    user: null,
    permissions: [],
    policy: { simulateFriday: false },
  });

  useEffect(() => {
    postToShell({ type: "APP_READY", payload: { appId: "deploy-list-app" } });

    function handleMessage(event: MessageEvent) {
      if (!isShellMessage(event.data)) return;
      const msg = event.data;

      if (msg.type === "SET_APP_CONTEXT") {
        setShellContext({
          user: msg.payload.user,
          permissions: msg.payload.permissions,
          policy: msg.payload.policy,
        });
        return;
      }

      if (msg.type === "DEPLOY_STATUS_UPDATED") {
        const { deployId, status } = msg.payload;
        setDeploys((prev) =>
          prev.map((d) =>
            d.id === deployId ? { ...d, status: status as DeployStatus } : d
          )
        );
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const requestNewDeploy = useCallback((deployId: string) => {
    postToShell({
      type: "OPEN_APP_REQUESTED",
      payload: { appId: "deploy-runner-app", params: { deployId } },
    });
  }, []);

  return { deploys, shellContext, requestNewDeploy };
}
