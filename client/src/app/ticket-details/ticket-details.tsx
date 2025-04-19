import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User } from "@acme/shared-models";
import { useTicketDetails } from "./useTicketDetails";

interface TicketDetailsProps {
  users: User[];
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ users }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    ticket,
    loading,
    error,
    actionLoading,
    actionError,
    selectedAssigneeId,
    updateTicketStatus,
    handleAssigneeChange,
  } = useTicketDetails(id);

  const getUserName = (userId: number | null): string => {
    if (userId === null) return "Unassigned";
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  if (loading)
    return <div className="p-4 text-center">Loading ticket details...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!ticket) return <div className="p-4 text-center">Ticket not found.</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-4">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Ticket Details</h2>
      <p className="mb-2">
        <strong>ID:</strong> {ticket.id}
      </p>
      <p className="mb-2">
        <strong>Description:</strong> {ticket.description}
      </p>
      <p className="mb-2">
        <strong>Status:</strong>{" "}
        {
          <span
            className={`font-semibold ${
              ticket.completed ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {ticket.completed ? "Completed" : "Incomplete"}
          </span>
        }
      </p>
      <p className="mb-4">
        <strong>Assignee:</strong> {getUserName(ticket.assigneeId)}
      </p>

      {actionError && (
        <p className="text-red-500 mb-4">Action Error: {actionError.message}</p>
      )}

      <div className="mb-4 flex space-x-2">
        {ticket.completed ? (
          <button
            onClick={() => updateTicketStatus(false)}
            disabled={actionLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? "Updating..." : "Mark as Incomplete"}
          </button>
        ) : (
          <button
            onClick={() => updateTicketStatus(true)}
            disabled={actionLoading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? "Updating..." : "Mark as Complete"}
          </button>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="assignee"
          className="block mb-1 font-medium text-gray-700"
        >
          Assign to:{" "}
        </label>
        <select
          id="assignee"
          value={selectedAssigneeId}
          onChange={(e) => handleAssigneeChange(e.target.value || null)}
          disabled={actionLoading}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:opacity-50 disabled:bg-gray-100"
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id.toString()}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
      >
        Back to List
      </button>
    </div>
  );
};

export default TicketDetails;
