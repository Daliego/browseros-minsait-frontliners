export type RunnerStatus = "waiting" | "idle" | "ready" | "running" | "done" | "rejected";

export type PipelineStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "error";
};

export const PIPELINE_STEPS: Omit<PipelineStep, "status">[] = [
  { id: "build", label: "Build" },
  { id: "tests", label: "Tests" },
  { id: "deploy", label: "Deploy" },
];
