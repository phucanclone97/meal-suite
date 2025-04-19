import { useEffect, useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { Ticket, User } from "@acme/shared-models";

import styles from "./app.module.css";
import Tickets from "./tickets/tickets";
import TicketDetails from "./ticket-details/ticket-details";

const App = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsResponse, usersResponse] = await Promise.all([
        fetch("/api/tickets"),
        fetch("/api/users"),
      ]);

      if (!ticketsResponse.ok || !usersResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const [ticketsData, usersData] = await Promise.all([
        ticketsResponse.json(),
        usersResponse.json(),
      ]);

      setTickets(ticketsData);
      setUsers(usersData);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTicket = useCallback(async (newTicket: Ticket) => {
    setTickets((currentTickets) => [...currentTickets, newTicket]);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className={styles["app"]}>
      <h1>Ticketing App</h1>
      <Routes>
        <Route
          path="/"
          element={
            <Tickets tickets={tickets} users={users} onAddTicket={addTicket} />
          }
        />
        <Route path="/:id" element={<TicketDetails users={users} />} />
      </Routes>
    </div>
  );
};

export default App;
