"use client";

import { useState, useCallback, useRef } from "react";
import type { ShellPolicy } from "@repo/contracts";
import { PIPELINE_STEPS } from "../types";
import type { PipelineStep, RunnerStatus } from "../types";

const FRIDAY_REJECTION_REASON =
  "Deploy na sexta-feira detectado. O BrowserOS bloqueou essa tentativa por motivos de paz coletiva.";

const STEP_DELAY_MS = 1200;

function delay(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

type UseDeployRunnerParams = {
  canDeploy: boolean;
  policy: ShellPolicy;
  deployId: string | null;
  onDeployStarted: (deployId: string) => void;
  onDeployDone: (deployId: string) => void;
  onDeployRejected: (deployId: string, reason: string) => void;
};

export function useDeployRunner({
  canDeploy,
  policy,
  deployId,
  onDeployStarted,
  onDeployDone,
  onDeployRejected,
}: UseDeployRunnerParams) {
  const [status, setStatus] = useState<RunnerStatus>("waiting");
  const [steps, setSteps] = useState<PipelineStep[]>(
    PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" }))
  );
  const [logs, setLogs] = useState<string[]>([]);
  const isRunningRef = useRef(false);

  function appendLog(line: string) {
    setLogs((prev) => [...prev, line]);
  }

  function setStepStatus(index: number, stepStatus: PipelineStep["status"]) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status: stepStatus } : s))
    );
  }

  const startDeploy = useCallback(async () => {
    if (!canDeploy || isRunningRef.current) return;

    const activeDeployId = deployId ?? `d-${Date.now()}`;

    if (policy.simulateFriday) {
      onDeployRejected(activeDeployId, FRIDAY_REJECTION_REASON);
      setStatus("rejected");
      appendLog(`❌ ${FRIDAY_REJECTION_REASON}`);
      return;
    }

    isRunningRef.current = true;
    setStatus("running");
    setLogs([]);
    setSteps(PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" })));

    onDeployStarted(activeDeployId);

    const stepMeta = [
      {
        start: "📦 Iniciando build...",
        done: "✅ Build concluído.",
      },
      {
        start: "🧪 Executando testes...",
        done: "✅ Testes passaram.",
      },
      {
        start: "🚀 Fazendo deploy...",
        done: "✅ Deploy concluído com sucesso!",
      },
    ];

    for (let i = 0; i < stepMeta.length; i++) {
      const step = stepMeta[i];
      if (!step) break;
      setStepStatus(i, "active");
      appendLog(step.start);
      await delay(STEP_DELAY_MS);
      setStepStatus(i, "done");
      appendLog(step.done);
    }

    onDeployDone(activeDeployId);
    setStatus("done");
    isRunningRef.current = false;
  }, [canDeploy, policy.simulateFriday, deployId, onDeployStarted, onDeployDone, onDeployRejected]);

  return {
    status,
    steps,
    logs,
    isRunning: status === "running",
    startDeploy,
  };
}
