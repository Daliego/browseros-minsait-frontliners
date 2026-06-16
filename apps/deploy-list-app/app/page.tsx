"use client";

import { Plus } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Deploys</h1>
            <p className="text-xs text-muted-foreground">{deploys.length} registros</p>
          </div>
          <button
            onClick={handleNewDeploy}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Deploy
          </button>
        </div>

        <DeployTable deploys={deploys} onRunDeploy={handleRunDeploy} />
      </div>
    </div>
  );
}
