import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PermissionBadge } from "../src/components/permission-badge";
import { StatusBadge } from "../src/components/status-badge";
import { cn } from "../src/lib/utils";

describe("StatusBadge", () => {
  it("renders done status with success styling", () => {
    const { container } = render(<StatusBadge status="done" />);
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-emerald-400");
  });

  it("renders rejected status with destructive styling", () => {
    render(<StatusBadge status="rejected" />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("renders running status with warning styling", () => {
    const { container } = render(<StatusBadge status="running" />);
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-yellow-400");
  });

  it("renders pending status with secondary styling", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});

describe("PermissionBadge", () => {
  it("renders deploy:execute label", () => {
    render(<PermissionBadge permission="deploy:execute" />);
    expect(screen.getByText("deploy:execute")).toBeInTheDocument();
  });

  it("renders deploy:view label", () => {
    render(<PermissionBadge permission="deploy:view" />);
    expect(screen.getByText("deploy:view")).toBeInTheDocument();
  });
});

describe("cn utility", () => {
  it("returns last-wins merged class for conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "nope", "added")).toBe("base added");
  });
});
