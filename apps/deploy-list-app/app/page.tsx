"use client";

import { Plus, RefreshCw } from "lucide-react";
import { DeployTable } from "../src/components/deploy-table";
import { useShellBridge } from "../src/hooks/use-shell-bridge";

export default function DeployListPage() {
  const { deploys, requestNewDeploy } = useShellBridge();

  const handleRunDeploy = (deployId: string) => {
    requestNewDeploy(deployId);
  };

  const handleNewDeploy = () => {
    const newId = `d-${Date.now()}`;
    requestNewDeploy(newId);
  };

  const runningCount = deploys.filter((d) => d.status === "running").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card/40 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-lg">📋</span>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-none">
                Deploy List
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {deploys.length} deploys
                {runningCount > 0 && (
                  <span className="ml-2 text-yellow-400 inline-flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {runningCount} em execução
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleNewDeploy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Deploy
          </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <DeployTable deploys={deploys} onRunDeploy={handleRunDeploy} />
      </div>
    </div>
  );
}
