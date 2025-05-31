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
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{ticket.title}</h3>
        <span className={`text-sm font-medium px-2 py-1 rounded-full 
          ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 
             ticket.status === 'closed' ? 'bg-red-100 text-red-700' : 
             'bg-yellow-100 text-yellow-700'}`}>
          {ticket.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
      <div className="mt-2 text-sm text-gray-500">
        Priority: <span className="capitalize">{ticket.priority}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1">Created: {new Date(ticket.createdAt).toLocaleString()}</div>
    </div>
  );
};

export default TicketCard;
