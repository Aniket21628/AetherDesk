'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchTicket = async () => {
      const res = await fetch(`http://localhost:5000/tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Failed to fetch');
      else {
        setTicket(data.ticket);
        setStatus(data.ticket.status);
      }
    };
    if (token) fetchTicket();
  }, [id, token]);

  const handleStatusChange = async () => {
    const res = await fetch(`http://localhost:5000/tickets/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to update status');
    } else {
      setTicket(data.ticket);
    }
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!ticket) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-2">{ticket.title}</h2>
      <p className="mb-2">{ticket.description}</p>
      <p className="text-sm text-gray-600 mb-4">Priority: {ticket.priority}</p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="open">Open</option>
          <option value="in progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <button
        onClick={handleStatusChange}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Status
      </button>

      <button
        onClick={() => router.push('/dashboard')}
        className="ml-4 text-blue-600 underline"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
