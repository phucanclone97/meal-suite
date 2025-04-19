import { useState } from "react";
import { Ticket, User } from "@acme/shared-models";
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

  const getFilterButtonClass = (status: FilterStatus): string => {
    const base = "px-3 py-1 rounded";
    const active =
      filter === status
        ? "bg-blue-500 text-white"
        : "bg-gray-200 hover:bg-gray-300";
    return `${base} ${active}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold border-b pb-3 mb-4">Ticketing App</h1>

      <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
        <NewTicketForm onSubmit={handleAddTicket} isLoading={addingTicket} />
        {addError && (
          <p className="text-red-600 mt-2">
            Error adding ticket: {addError.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md border border-gray-200">
        <span className="font-medium text-gray-700">Filter by status:</span>
        <button
          onClick={() => setFilter("all")}
          className={getFilterButtonClass("all")}
        >
          All
        </button>
        <button
          onClick={() => setFilter("incomplete")}
          className={getFilterButtonClass("incomplete")}
        >
          Incomplete
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={getFilterButtonClass("completed")}
        >
          Completed
        </button>
      </div>

      {filteredTickets.length > 0 ? (
        <ul className="divide-y divide-gray-300 border border-gray-200 rounded-md shadow-sm">
          {filteredTickets.map((t) => (
            <li
              key={t.id}
              className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors duration-150"
            >
              <Link
                to={`/${t.id}`}
                className="text-blue-700 hover:text-blue-900 hover:underline font-medium"
              >
                {t.description}
              </Link>
              <span
                className={`text-sm font-semibold px-2 py-0.5 rounded ${
                  t.completed
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {t.completed ? "Completed" : "Incomplete"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No tickets match the current filter.</p>
      )}
    </div>
  );
}

export default Tickets;
