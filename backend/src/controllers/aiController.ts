import { Request, Response, NextFunction } from "express";
import { generateGeminiResponse, testGeminiConnection } from "../services/langchainService";

export const chatWithAI = async (req: Request, res: Response, next: NextFunction) => {
  console.log('=== Gemini Chat Request Received ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { message } = req.body;
  
  // Enhanced validation
  if (!message) {
    console.log('ERROR: Missing message');
    return res.status(400).json({ 
      error: "Message is required",
      code: "MISSING_MESSAGE"
    });
  }

  if (typeof message !== 'string') {
    console.log('ERROR: Invalid message type:', typeof message);
    return res.status(400).json({ 
      error: "Message must be a string",
      code: "INVALID_MESSAGE_TYPE"
    });
  }

  if (message.trim().length === 0) {
    console.log('ERROR: Empty message');
    return res.status(400).json({ 
      error: "Message cannot be empty",
      code: "EMPTY_MESSAGE"
    });
  }

  if (message.length > 8000) { // Gemini has higher limits
    console.log('ERROR: Message too long');
    return res.status(400).json({ 
      error: "Message too long. Maximum 8000 characters allowed.",
      code: "MESSAGE_TOO_LONG"
    });
  }

  try {
    console.log('Processing message with Gemini:', message);
    
    const aiResponse = await generateGeminiResponse(message);
    
    console.log('Gemini AI Response generated successfully');
    console.log('Response length:', aiResponse.length);
    
    const responseObj = { 
      response: aiResponse,
      timestamp: new Date().toISOString(),
      model: "gemini-pro",
      provider: "Google"
    };
    
    console.log('Sending Gemini response');
    res.json(responseObj);
    
  } catch (error) {
    console.log('=== Gemini Controller Error ===');
    // Simple error logger
    console.error(`[Gemini Controller]`, error);
    
    // Handle specific Gemini error types
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("QUOTA_EXCEEDED")) {
        return res.status(429).json({ 
          error: "Gemini quota exceeded. Please try again later.",
          code: "RATE_LIMIT"
        });
      }
      
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        return res.status(401).json({ 
          error: "Gemini API configuration error",
          code: "API_ERROR"
        });
      }
      
      if (error.message.includes("safety") || error.message.includes("BLOCKED")) {
        return res.status(400).json({ 
          error: "Content blocked by safety filters. Please rephrase your message.",
          code: "CONTENT_BLOCKED"
        });
      }
      
      if (error.message.includes("timeout")) {
        return res.status(408).json({ 
          error: "Request timeout",
          code: "TIMEOUT"
        });
      }
    }
    
    res.status(500).json({ 
      error: "Gemini AI response failed",
      code: "AI_SERVICE_ERROR",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Test endpoint for Gemini
export const testGeminiAPI = async (req: Request, res: Response) => {
  try {
    const result = await testGeminiConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Test failed'
    });
  }
};
