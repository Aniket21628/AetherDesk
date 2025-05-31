// backend/routes/chat.ts (or wherever your chat route is)
import { Request, Response } from 'express';
import { generateGeminiResponse, clearSession, getSessionHistory } from '../services/langchainService'; // adjust path

interface ChatRequest extends Request {
  body: {
    message: string;
    sessionId?: string;
  };
}

// Main chat endpoint
export const handleChatMessage = async (req: ChatRequest, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
      return;
    }

    console.log('Processing chat message:', message);
    console.log('Session ID:', sessionId || 'new session');

    // Generate response with conversation history
    const result = await generateGeminiResponse(message, sessionId);

    res.json({
      response: result.response,
      sessionId: result.sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

// Optional: Endpoint to clear conversation history
export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    clearSession(sessionId);
    
    res.json({ 
      message: 'Conversation history cleared',
      sessionId 
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ 
      error: 'Failed to clear conversation history' 
    });
  }
};

// Optional: Endpoint to get conversation history
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    const history = getSessionHistory(sessionId);
    
    res.json({ 
      history,
      sessionId,
      messageCount: history.length 
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve conversation history' 
    });
  }
};

// Your route setup (adjust based on your app structure)
// app.post('/ai/chat', handleChatMessage);
// app.post('/ai/clear', clearChatHistory);
// app.get('/ai/history/:sessionId', getChatHistory);