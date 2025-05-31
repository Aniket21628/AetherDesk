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
  const { token, logout } = useAuth(); // hook 1
  const router = useRouter();         // hook 2

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
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

    if (token) {
      fetchTickets();
    }
  }, [token]);

  if (!token) return <p>Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-blue-100 to-white">
  <h1 className="text-4xl font-bold mb-10 text-blue-900">🎫 Ticket Dashboard</h1>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {['open', 'in progress', 'closed'].map(status => (
      <div key={status}>
        <h2 className="text-2xl font-semibold mb-4 capitalize text-gray-800">
          {status.replace('_', ' ')}
        </h2>

        {tickets.filter(t => t.status.toLowerCase() === status).length === 0 ? (
          <p className="text-gray-500 italic">No tickets</p>
        ) : (
          tickets
            .filter(t => t.status.toLowerCase() === status)
            .map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
        )}
      </div>
    ))}
  </div>
</div>

  );
}
