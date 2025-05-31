"use client"

import { useState, useRef, useEffect } from 'react';

interface Message {
  from: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      from: 'user', 
      text: input.trim(),
      timestamp: new Date().toISOString()
    };
    
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
        body: JSON.stringify({ 
          message: userMessage.text,
          sessionId: sessionId // Include current session ID
        }),
      });
   
      const data = await res.json();

      if (res.ok) {
        // Update session ID if it's a new conversation
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
        }

        setMessages((prev) => [...prev, { 
          from: 'ai', 
          text: data.response,
          timestamp: data.timestamp 
        }]);
      } else {
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

  const clearConversation = async () => {
    if (!sessionId) {
      // If no session, just clear local messages
      setMessages([]);
      return;
    }

    try {
      const res = await fetch('/api/ai/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setMessages([]);
        setSessionId(null); // Reset session
      } else {
        console.error('Failed to clear conversation on server');
        // Still clear locally
        setMessages([]);
        setSessionId(null);
      }
    } catch (error) {
      console.error('Error clearing conversation:', error);
      // Still clear locally
      setMessages([]);
      setSessionId(null);
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
      {/* Header with session info and clear button */}
      <div className="flex justify-between items-center p-3 border-b bg-gray-50">
        <div className="text-sm text-gray-600">
          {sessionId ? `Session: ${sessionId.substring(0, 8)}...` : 'New Conversation'}
        </div>
        <button
          onClick={clearConversation}
          className="text-sm text-red-600 hover:text-red-800 transition-colors"
          disabled={loading}
        >
          Clear Chat
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Start a conversation! Your messages will be remembered throughout this session.
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 p-3 rounded-lg max-w-[80%] ${
              msg.from === 'user' 
                ? 'bg-blue-500 text-white ml-auto' 
                : 'bg-gray-300 text-gray-800 mr-auto'
            }`}
          >
            <div>{msg.text}</div>
            {msg.timestamp && (
              <div className={`text-xs mt-1 opacity-70 ${
                msg.from === 'user' ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}
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

      {/* Input area */}
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