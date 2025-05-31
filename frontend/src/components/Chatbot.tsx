"use client"

import { useState, useRef, useEffect } from 'react';

interface Message {
  from: 'user' | 'ai';
  text: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { from: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: userMessage.text }),
      });
   
      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { from: 'ai', text: data.response }]);
      } else {
        // Better error handling with specific error messages
        const errorMessage = data.error || data.message || `Server error: ${res.status} ${res.statusText}`;
        console.error('API Error:', errorMessage, data);
        setMessages((prev) => [...prev, { 
          from: 'ai', 
          text: `Error: ${errorMessage}` 
        }]);
      }
    } catch (error) {
      console.error('Network error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
      setMessages((prev) => [...prev, { 
        from: 'ai', 
        text: `Network error: ${errorMessage}. Make sure your server is running on http://localhost:5000` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col max-w-xl mx-auto h-[500px] border rounded-lg shadow-lg">
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 p-3 rounded-lg max-w-[80%] ${
              msg.from === 'user' 
                ? 'bg-blue-500 text-white ml-auto' 
                : 'bg-gray-300 text-gray-800 mr-auto'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="my-2 p-3 rounded-lg max-w-[80%] bg-gray-200 text-gray-600 mr-auto">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
              AI is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white flex items-center gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Type your message..."
          className="flex-grow border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}