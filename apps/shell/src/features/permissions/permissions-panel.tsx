"use client";

import { Shield, Check, X, AlertTriangle } from "lucide-react";
import { useShellState } from "../shell-state/shell-context";
import { usePermissions } from "./use-permissions";
import type { AppId, AppPermission } from "@repo/contracts";

const ALL_PERMISSIONS: AppPermission[] = [
  "deploy:view",
  "deploy:write",
  "deploy:execute",
];

interface PermissionsPanelProps {
  onClose: () => void;
}

export function PermissionsPanel({ onClose }: PermissionsPanelProps) {
  const { state, dispatch } = useShellState();
  const { can, revokePermission, grantPermission } = usePermissions();
  const appIds = Object.keys(state.permissions) as AppId[];

  return (
    <div className="absolute top-12 right-4 w-72 bg-[oklch(0.18_0.01_260)]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-medium text-white text-sm">Permissões</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="p-3 space-y-4">
        {appIds.map((appId) => (
          <div key={appId}>
            <p className="text-xs text-white/40 font-mono mb-1.5">{appId}</p>
            <div className="space-y-1.5">
              {ALL_PERMISSIONS.map((perm) => {
                const active = can(appId, perm);
                return (
                  <div
                    key={perm}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-white/70 font-mono">
                      {perm}
                    </span>
                    <button
                      onClick={() =>
                        active
                          ? revokePermission(appId, perm)
                          : grantPermission(appId, perm)
                      }
                      className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                        active
                          ? "bg-accent/20 text-accent hover:bg-accent/30"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {active ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      {active ? "ativo" : "inativo"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="border-t border-white/10 pt-3">
          <button
            onClick={() => dispatch({ type: "TOGGLE_FRIDAY" })}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              state.policy.simulateFriday
                ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Simular Sexta-feira
            {state.policy.simulateFriday && (
              <span className="ml-auto text-[10px] font-bold">ATIVO</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
