import { useState, useEffect, useCallback } from "react";
import { Ticket } from "@acme/shared-models";

interface UseTicketDetailsReturn {
  ticket: Ticket | null;
  loading: boolean;
  error: Error | null;
  actionLoading: boolean;
  actionError: Error | null;
  selectedAssigneeId: string;
  setSelectedAssigneeId: React.Dispatch<React.SetStateAction<string>>;
  updateTicketStatus: (completed: boolean) => Promise<void>;
  handleAssigneeChange: (userId: string | null) => Promise<void>;
}

export const useTicketDetails = (
  id: string | undefined
): UseTicketDetailsReturn => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");

  const fetchTicket = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      const response = await fetch(`/api/tickets/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch ticket details");
      }
      const data: Ticket = await response.json();
      setTicket(data);
      setSelectedAssigneeId(data.assigneeId?.toString() || "");
    } catch (e) {
      setError(e instanceof Error ? e : new Error("An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    if (ticket) {
      setSelectedAssigneeId(ticket.assigneeId?.toString() || "");
    }
  }, [ticket]);

  const updateTicketStatus = useCallback(
    async (completed: boolean) => {
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
    },
    [ticket]
  );

  const handleAssigneeChange = useCallback(
    async (userId: string | null) => {
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

        // Update local state immediately for better UX
        setTicket((prevTicket) =>
          prevTicket ? { ...prevTicket, assigneeId } : null
        );
        // Optionally refetch or update based on API response if needed
      } catch (e) {
        // Revert optimistic update on error if necessary
        setActionError(
          e instanceof Error
            ? e
            : new Error("An unknown error occurred during assignment")
        );
        // Consider reverting the state change here if the API call failed
        fetchTicket(); // Refetch to get the source of truth
      } finally {
        setActionLoading(false);
      }
    },
    [ticket, fetchTicket]
  );

  return {
    ticket,
    loading,
    error,
    actionLoading,
    actionError,
    selectedAssigneeId,
    setSelectedAssigneeId,
    updateTicketStatus,
    handleAssigneeChange,
  };
};
