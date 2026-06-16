"use client";

import { User, ShieldCheck, ShieldOff } from "lucide-react";
import type { RunnerStatus } from "../types";

type ContextCardProps = {
  userName: string | null;
  canDeploy: boolean;
  deployId: string | null;
  status: RunnerStatus;
};

export function ContextCard({ userName, canDeploy, deployId, status }: ContextCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{userName ?? "Aguardando contexto..."}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {canDeploy ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">deploy:execute</span>
            </>
          ) : (
            <>
              <ShieldOff className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">sem permissão</span>
            </>
          )}
        </div>
      </div>
      {deployId && (
        <p className="text-xs text-muted-foreground font-mono">
          deploy #{deployId} · {status}
        </p>
      )}
    </div>
  );
}
