import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders text for every status, not colour alone", () => {
    const { rerender } = render(<StatusBadge status="on_track" />);
    expect(screen.getByText("On track")).toBeInTheDocument();

    rerender(<StatusBadge status="at_risk" />);
    expect(screen.getByText("At risk")).toBeInTheDocument();

    rerender(<StatusBadge status="off_track" />);
    expect(screen.getByText("Off track")).toBeInTheDocument();
  });
});
