import type { AppId, AppPermission } from "./types";

export type AppManifest = {
  appId: AppId;
  name: string;
  description: string;
  icon: string;
  url: string;
  requiredPermissions: AppPermission[];
  defaultWindowSize: { width: number; height: number };
};
