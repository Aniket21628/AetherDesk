import React from 'react';

type Ticket = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
};

const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const statusColors = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
    'in progress': 'bg-yellow-100 text-yellow-800',
  };

  const priorityColors = {
    high: 'text-red-600 font-semibold',
    medium: 'text-yellow-600 font-medium',
    low: 'text-green-600 font-normal',
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg mb-4 transition-all hover:shadow-2xl border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${statusColors[ticket.status.toLowerCase() as keyof typeof statusColors]}`}>
          {ticket.status}
        </span>
        <span className={`text-sm ${priorityColors[ticket.priority.toLowerCase() as keyof typeof priorityColors]}`}>
          {ticket.priority}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-800">{ticket.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
      <div className="text-xs text-gray-400">Created: {new Date(ticket.createdAt).toLocaleString()}</div>
    </div>
  );
};


export default TicketCard;
