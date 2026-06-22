"use client";

import { StatusBadge } from "@repo/ui";
import { Play } from "lucide-react";
import type { Deploy } from "../data/mock-deploys";

type DeployTableProps = {
  deploys: Deploy[];
  onRunDeploy: (deployId: string) => void;
};

export function DeployTable({ deploys, onRunDeploy }: DeployTableProps) {
  return (
    <div className="space-y-2">
      {deploys.map((deploy) => (
        <div
          key={deploy.id}
          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {deploy.appName}
              </p>
              <p className="text-xs text-muted-foreground">
                {deploy.environment} · {deploy.owner}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={deploy.status} />
            <button
              onClick={() => onRunDeploy(deploy.id)}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              title="Executar deploy"
              aria-label={`Executar deploy ${deploy.appName}`}
            >
              <Play className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
