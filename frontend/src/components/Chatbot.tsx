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
          sessionId: sessionId
        }),
      });
   
      const data = await res.json();

      if (res.ok) {
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
        console.error('API Error:', errorMessage);
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
        text: `Network error: ${errorMessage}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      const res = await fetch('/api/ai/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      setMessages([]);
      setSessionId(null);
    } catch (error) {
      console.error('Error clearing conversation:', error);
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
    <div className="flex flex-col max-w-xl mx-auto h-[500px] border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b bg-gray-100 text-sm text-gray-700">
        <div>
          {sessionId ? `Session: ${sessionId.substring(0, 8)}...` : 'New Conversation'}
        </div>
        <button
          onClick={clearConversation}
          className="text-red-500 hover:text-red-700 transition-colors"
          disabled={loading}
        >
          Clear Chat
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-white space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            Start a conversation...
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-xl px-4 py-2 max-w-[75%] text-sm break-words ${
              msg.from === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              {msg.text}
              {msg.timestamp && (
                <div className={`text-xs mt-1 opacity-70 ${
                  msg.from === 'user' ? 'text-blue-100 text-right' : 'text-gray-500'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-xl max-w-[75%]">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                AI is thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t bg-gray-50 flex gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Type your message..."
          className="flex-grow border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
