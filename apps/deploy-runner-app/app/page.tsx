"use client";

import { useCallback } from "react";
import { Play, Loader2 } from "lucide-react";
import { ContextCard } from "../src/components/context-card";
import { PipelineSteps } from "../src/components/pipeline-steps";
import { LogArea } from "../src/components/log-area";
import { useShellBridge } from "../src/hooks/use-shell-bridge";
import { useDeployRunner } from "../src/hooks/use-deploy-runner";

export default function DeployRunnerPage() {
  const { shellContext, postToShell } = useShellBridge();

  const canDeploy = shellContext.permissions.includes("deploy:execute");

  const onDeployStarted = useCallback(
    (deployId: string) => {
      postToShell({ type: "DEPLOY_STARTED", payload: { deployId } });
      postToShell({
        type: "PUSH_NOTIFICATION",
        payload: {
          title: "Deploy iniciado",
          message: "A esteira de deploy foi iniciada.",
          variant: "info",
        },
      });
    },
    [postToShell]
  );

  const onDeployDone = useCallback(
    (deployId: string) => {
      postToShell({ type: "DEPLOY_DONE", payload: { deployId } });
      postToShell({
        type: "PUSH_NOTIFICATION",
        payload: {
          title: "Deploy concluído",
          message: "O deploy foi concluído com sucesso!",
          variant: "success",
        },
      });
    },
    [postToShell]
  );

  const onDeployRejected = useCallback(
    (deployId: string, reason: string) => {
      postToShell({ type: "DEPLOY_REJECTED", payload: { deployId, reason } });
      postToShell({
        type: "PUSH_NOTIFICATION",
        payload: {
          title: "Deploy bloqueado",
          message: reason,
          variant: "error",
        },
      });
    },
    [postToShell]
  );

  const { status, steps, logs, isRunning, startDeploy } = useDeployRunner({
    canDeploy,
    policy: shellContext.policy,
    deployId: shellContext.currentDeployId,
    onDeployStarted,
    onDeployDone,
    onDeployRejected,
  });

  const isWaiting = shellContext.user === null;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Deploy Runner</h1>
        <p className="text-xs text-muted-foreground">Executa deploys com controle de permissão</p>
      </div>

      <ContextCard
        userName={shellContext.user?.name ?? null}
        canDeploy={canDeploy}
        deployId={shellContext.currentDeployId}
        status={status}
      />

      <PipelineSteps steps={steps} />

      <LogArea logs={logs} isRunning={isRunning} />

      <button
        onClick={startDeploy}
        disabled={!canDeploy || isRunning || isWaiting || status === "done"}
        className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 disabled:bg-primary/30 disabled:cursor-not-allowed text-primary-foreground rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Executando...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            {isWaiting ? "Aguardando contexto..." : "Iniciar deploy"}
          </>
        )}
      </button>
    </div>
  );
}
