import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppCard } from "../components/app-card";
import { Dock } from "../components/dock";
import { TopBar } from "../components/top-bar";
import type { AppManifest, OpenedApp } from "@repo/contracts";

const manifest: AppManifest = {
  appId: "deploy-list-app",
  name: "Deploy List",
  description: "Lista e acompanha deploys",
  icon: "📋",
  url: "http://localhost:3001",
  requiredPermissions: ["deploy:view"],
  defaultWindowSize: { width: 720, height: 480 },
};

const manifest2: AppManifest = {
  appId: "deploy-runner-app",
  name: "Deploy Runner",
  description: "Executa deploys",
  icon: "🚀",
  url: "http://localhost:3002",
  requiredPermissions: ["deploy:view", "deploy:execute"],
  defaultWindowSize: { width: 640, height: 520 },
};

describe("AppCard", () => {
  it("renders app name from manifest", () => {
    render(<AppCard manifest={manifest} onOpen={() => {}} />);
    expect(screen.getByText("Deploy List")).toBeDefined();
  });

  it("renders app icon from manifest", () => {
    render(<AppCard manifest={manifest} onOpen={() => {}} />);
    expect(screen.getByText("📋")).toBeDefined();
  });

  it("calls onOpen with the correct appId on click", () => {
    const onOpen = vi.fn();
    render(<AppCard manifest={manifest} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalledWith("deploy-list-app");
  });
});

describe("Dock", () => {
  it("renders all app buttons from the apps prop", () => {
    const openedApps: OpenedApp[] = [
      { appId: "deploy-list-app", windowId: "w1", openedAt: Date.now() },
      { appId: "deploy-runner-app", windowId: "w2", openedAt: Date.now() },
    ];
    render(
      <Dock
        apps={[manifest, manifest2]}
        openedApps={openedApps}
        onAppClick={() => {}}
        onNotificationClick={() => {}}
      />
    );
    expect(screen.getByTitle("Deploy List")).toBeDefined();
    expect(screen.getByTitle("Deploy Runner")).toBeDefined();
  });

  it("shows correct open count when openedApps has 2 entries", () => {
    const openedApps: OpenedApp[] = [
      { appId: "deploy-list-app", windowId: "w1", openedAt: Date.now() },
      { appId: "deploy-runner-app", windowId: "w2", openedAt: Date.now() },
    ];
    render(
      <Dock
        apps={[manifest, manifest2]}
        openedApps={openedApps}
        onAppClick={() => {}}
        onNotificationClick={() => {}}
      />
    );
    expect(screen.getByText("2")).toBeDefined();
  });
});

describe("TopBar", () => {
  it("renders the user name", () => {
    render(
      <TopBar
        userName="Lucas"
        environment="staging"
        notificationCount={0}
        onNotificationClick={() => {}}
        onPermissionsClick={() => {}}
      />
    );
    expect(screen.getByText("Lucas")).toBeDefined();
  });
});
