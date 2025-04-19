import { useState } from "react";
import { Ticket, User } from "@acme/shared-models";
import styles from "./tickets.module.css";
import { Link } from "react-router-dom";
import NewTicketForm from "./new-ticket-form";

type FilterStatus = "all" | "completed" | "incomplete";

export interface TicketsProps {
  tickets: Ticket[];
  users: User[];
  onAddTicket: (newTicket: Ticket) => void;
}

export function Tickets({ tickets, users, onAddTicket }: TicketsProps) {
  const [addingTicket, setAddingTicket] = useState(false);
  const [addError, setAddError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");

  const handleAddTicket = async (description: string) => {
    setAddingTicket(true);
    setAddError(null);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to add ticket");
      }

      const newTicket = await response.json();
      onAddTicket(newTicket);
    } catch (e) {
      setAddError(
        e instanceof Error
          ? e
          : new Error("An unknown error occurred during add")
      );
    } finally {
      setAddingTicket(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "completed") return ticket.completed;
    if (filter === "incomplete") return !ticket.completed;
    return true;
  });

  return (
    <div className={styles["tickets"]}>
      <h2>Tickets</h2>

      <NewTicketForm onSubmit={handleAddTicket} isLoading={addingTicket} />
      {addError && (
        <p style={{ color: "red" }}>Error adding ticket: {addError.message}</p>
      )}

      <div style={{ margin: "1rem 0" }}>
        Filter by status:
        <button
          onClick={() => setFilter("all")}
          disabled={filter === "all"}
          style={{ marginLeft: "0.5rem" }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("incomplete")}
          disabled={filter === "incomplete"}
          style={{ marginLeft: "0.5rem" }}
        >
          Incomplete
        </button>
        <button
          onClick={() => setFilter("completed")}
          disabled={filter === "completed"}
          style={{ marginLeft: "0.5rem" }}
        >
          Completed
        </button>
      </div>

      {filteredTickets.length > 0 ? (
        <ul>
          {filteredTickets.map((t) => (
            <li key={t.id}>
              <Link to={`/${t.id}`}>{t.description}</Link>
              <span>{t.completed ? " (Completed)" : " (Incomplete)"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tickets match the current filter.</p>
      )}
    </div>
  );
}

export default Tickets;
