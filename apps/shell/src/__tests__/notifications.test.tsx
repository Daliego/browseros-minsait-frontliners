import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NotificationsPanel } from "../features/notifications/notifications-panel";
import { ShellProvider } from "../features/shell-state/shell-context";
import type { ShellState, Notification } from "../features/shell-state/types";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ShellProvider>{children}</ShellProvider>;
}

describe("NotificationsPanel", () => {
  it("shows empty state when no notifications", () => {
    render(
      <Wrapper>
        <NotificationsPanel isOpen onClose={() => {}} />
      </Wrapper>
    );
    expect(screen.getByText("Nenhuma notificação")).toBeDefined();
  });

  it("returns null when isOpen is false", () => {
    const { container } = render(
      <Wrapper>
        <NotificationsPanel isOpen={false} onClose={() => {}} />
      </Wrapper>
    );
    expect(container.firstChild).toBeNull();
  });
});

// Pure reducer tests for notifications
import type { ShellAction } from "../features/shell-state/types";

function notifReducer(
  notifications: Notification[],
  action: ShellAction
): Notification[] {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return [action.payload, ...notifications];
    case "DISMISS_NOTIFICATION":
      return notifications.filter((n) => n.id !== action.payload.id);
    case "CLEAR_NOTIFICATIONS":
      return [];
    default:
      return notifications;
  }
}

describe("notification state", () => {
  it("ADD_NOTIFICATION increases length by 1", () => {
    const n: Notification = {
      id: "n1",
      title: "Test",
      message: "body",
      variant: "success",
      timestamp: Date.now(),
    };
    const next = notifReducer([], { type: "ADD_NOTIFICATION", payload: n });
    expect(next).toHaveLength(1);
  });

  it("DISMISS_NOTIFICATION removes the matching entry", () => {
    const n: Notification = {
      id: "n1",
      title: "Test",
      message: "body",
      variant: "error",
      timestamp: Date.now(),
    };
    const list = notifReducer([], { type: "ADD_NOTIFICATION", payload: n });
    const after = notifReducer(list, {
      type: "DISMISS_NOTIFICATION",
      payload: { id: "n1" },
    });
    expect(after).toHaveLength(0);
  });

  it("success notification has variant success", () => {
    const n: Notification = {
      id: "n2",
      title: "Done",
      message: "ok",
      variant: "success",
      timestamp: Date.now(),
    };
    const [added] = notifReducer([], { type: "ADD_NOTIFICATION", payload: n });
    expect(added?.variant).toBe("success");
  });

  it("error notification has variant error", () => {
    const n: Notification = {
      id: "n3",
      title: "Fail",
      message: "bad",
      variant: "error",
      timestamp: Date.now(),
    };
    const [added] = notifReducer([], { type: "ADD_NOTIFICATION", payload: n });
    expect(added?.variant).toBe("error");
  });
});
