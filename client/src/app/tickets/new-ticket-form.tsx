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
    <form onSubmit={handleSubmit}>
      <h3>Add New Ticket</h3>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter ticket description"
        disabled={isLoading}
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Ticket"}
      </button>
    </form>
  );
};

export default NewTicketForm;
