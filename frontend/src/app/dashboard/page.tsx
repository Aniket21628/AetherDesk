'use client';

import { useEffect, useState } from 'react';
import TicketCard from '@/components/TicketCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type Ticket = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();
  const router = useRouter();

    useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!token) return <p>Loading...</p>;

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      } else {
        setError(data.error || 'Failed to fetch tickets');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Ticket Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
