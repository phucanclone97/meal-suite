import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Ticket, User } from "@acme/shared-models";

interface TicketDetailsProps {
  users: User[];
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ users }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      setActionError(null);
      try {
        const response = await fetch(`/api/tickets/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch ticket details");
        }
        const data = await response.json();
        setTicket(data);
        setSelectedAssigneeId(data.assigneeId?.toString() || "");
      } catch (e) {
        setError(
          e instanceof Error ? e : new Error("An unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  useEffect(() => {
    if (ticket) {
      setSelectedAssigneeId(ticket.assigneeId?.toString() || "");
    }
  }, [ticket]);

  const getUserName = (userId: number | null): string => {
    if (userId === null) return "Unassigned";
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const updateTicketStatus = async (completed: boolean) => {
    if (!ticket) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const url = `/api/tickets/${ticket.id}/complete`;
      const method = completed ? "PUT" : "DELETE";
      const response = await fetch(url, { method });

      if (!response.ok) {
        throw new Error(
          `Failed to mark ticket as ${completed ? "complete" : "incomplete"}`
        );
      }

      setTicket((prevTicket) =>
        prevTicket ? { ...prevTicket, completed } : null
      );
    } catch (e) {
      setActionError(
        e instanceof Error ? e : new Error("An unknown error occurred")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssigneeChange = async (userId: string | null) => {
    if (!ticket) return;
    const assigneeId = userId ? parseInt(userId, 10) : null;

    setActionLoading(true);
    setActionError(null);

    try {
      let url: string;
      if (assigneeId !== null) {
        url = `/api/tickets/${ticket.id}/assign/${assigneeId}`;
      } else {
        url = `/api/tickets/${ticket.id}/unassign`;
      }

      const response = await fetch(url, { method: "PUT" });

      if (!response.ok) {
        throw new Error(
          `Failed to ${assigneeId !== null ? "assign" : "unassign"} ticket`
        );
      }

      setTicket((prevTicket) =>
        prevTicket ? { ...prevTicket, assigneeId } : null
      );
    } catch (e) {
      setActionError(
        e instanceof Error
          ? e
          : new Error("An unknown error occurred during assignment")
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Loading ticket details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!ticket) return <div>Ticket not found.</div>;

  return (
    <div>
      <h2>Ticket Details</h2>
      <p>
        <strong>ID:</strong> {ticket.id}
      </p>
      <p>
        <strong>Description:</strong> {ticket.description}
      </p>
      <p>
        <strong>Status:</strong> {ticket.completed ? "Completed" : "Incomplete"}
      </p>
      <p>
        <strong>Assignee:</strong> {getUserName(ticket.assigneeId)}
      </p>

      {actionError && (
        <p style={{ color: "red" }}>Action Error: {actionError.message}</p>
      )}

      <div style={{ marginBottom: "1rem" }}>
        {ticket.completed ? (
          <button
            onClick={() => updateTicketStatus(false)}
            disabled={actionLoading}
          >
            {actionLoading ? "Updating..." : "Mark as Incomplete"}
          </button>
        ) : (
          <button
            onClick={() => updateTicketStatus(true)}
            disabled={actionLoading}
          >
            {actionLoading ? "Updating..." : "Mark as Complete"}
          </button>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="assignee">Assign to: </label>
        <select
          id="assignee"
          value={selectedAssigneeId}
          onChange={(e) => handleAssigneeChange(e.target.value || null)}
          disabled={actionLoading}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id.toString()}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={() => navigate(-1)} style={{ marginTop: "1rem" }}>
        Back to List
      </button>
    </div>
  );
};

export default TicketDetails;
