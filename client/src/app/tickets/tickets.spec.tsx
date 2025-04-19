import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Ticket, User } from "@acme/shared-models";
import Tickets from "./tickets";

const mockTickets: Ticket[] = [
  { id: 1, description: "Test Ticket 1", assigneeId: 1, completed: false },
  { id: 2, description: "Test Ticket 2", assigneeId: null, completed: true },
];

const mockUsers: User[] = [{ id: 1, name: "Alice" }];

const mockOnAddTicket = jest.fn();

describe("Tickets Component", () => {
  it("should render the list of tickets", () => {
    render(
      <BrowserRouter>
        {" "}
        {/* Wrap with BrowserRouter for Link component */}
        <Tickets
          tickets={mockTickets}
          users={mockUsers}
          onAddTicket={mockOnAddTicket}
        />
      </BrowserRouter>
    );

    // Check if ticket descriptions are rendered
    expect(screen.getByText("Test Ticket 1")).toBeVisible();
    expect(screen.getByText("Test Ticket 2")).toBeVisible();

    // Check status rendering (optional but good)
    expect(screen.getByText("(Incomplete)")).toBeVisible();
    expect(screen.getByText("(Completed)")).toBeVisible();
  });

  it('should render the "Add New Ticket" form', () => {
    render(
      <BrowserRouter>
        <Tickets
          tickets={mockTickets}
          users={mockUsers}
          onAddTicket={mockOnAddTicket}
        />
      </BrowserRouter>
    );

    expect(
      screen.getByPlaceholderText("Enter ticket description")
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /Add Ticket/i })).toBeVisible();
  });

  it("should render filter buttons", () => {
    render(
      <BrowserRouter>
        <Tickets
          tickets={mockTickets}
          users={mockUsers}
          onAddTicket={mockOnAddTicket}
        />
      </BrowserRouter>
    );
    expect(screen.getByRole("button", { name: /All/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Incomplete/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Completed/i })).toBeVisible();
  });

  // We could add more tests for filtering logic, form submission, etc.
});
