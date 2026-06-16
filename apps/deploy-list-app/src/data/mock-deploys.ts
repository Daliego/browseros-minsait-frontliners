import type { DeployStatus } from "@repo/contracts";

export type Deploy = {
  id: string;
  appName: string;
  environment: string;
  owner: string;
  status: DeployStatus;
};

export const mockDeploys: Deploy[] = [
  {
    id: "d-001",
    appName: "api-service",
    environment: "staging",
    owner: "lucas",
    status: "done",
  },
  {
    id: "d-002",
    appName: "frontend",
    environment: "production",
    owner: "mariana",
    status: "pending",
  },
  {
    id: "d-003",
    appName: "worker",
    environment: "staging",
    owner: "carlos",
    status: "running",
  },
];
