import React, { useState } from "react";

interface NewTicketFormProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
}

const NewTicketForm: React.FC<NewTicketFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [description, setDescription] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!description.trim()) return; // Prevent submitting empty descriptions
    onSubmit(description);
    setDescription(""); // Clear the input after submission
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <label htmlFor="new-ticket-desc" className="sr-only">
        {" "}
        {/* Screen reader only label */}
        New Ticket Description
      </label>
      <input
        id="new-ticket-desc"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter ticket description"
        disabled={isLoading}
        required
        className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Adding..." : "Add Ticket"}
      </button>
    </form>
  );
};

export default NewTicketForm;
