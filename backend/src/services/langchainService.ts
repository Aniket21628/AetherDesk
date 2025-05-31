import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

// Environment check for Gemini
const checkGeminiEnvironment = () => {
  console.log('=== Gemini Environment Check ===');
  console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
  console.log('GOOGLE_API_KEY length:', process.env.GOOGLE_API_KEY?.length);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('===============================');
};

// Call this when your service starts
checkGeminiEnvironment();

// Initialize Gemini model
const geminiModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.7,
  maxOutputTokens: 1000,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

// Interface for conversation history
interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// In-memory storage for conversations (use Redis/Database in production)
const conversationStore = new Map<string, ConversationEntry[]>();

// Generate unique session ID (you can pass this from frontend or generate here)
const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get conversation history for a session
const getConversationHistory = (sessionId: string): ConversationEntry[] => {
  return conversationStore.get(sessionId) || [];
};

// Add message to conversation history
const addToConversationHistory = (sessionId: string, role: 'user' | 'assistant', content: string): void => {
  const history = getConversationHistory(sessionId);
  history.push({
    role,
    content,
    timestamp: new Date()
  });
  
  // Keep only last 20 messages to manage token limits (adjust as needed)
  if (history.length > 20) {
    history.splice(0, history.length - 20);
  }
  
  conversationStore.set(sessionId, history);
};

// Clear conversation history for a session
const clearConversationHistory = (sessionId: string): void => {
  conversationStore.delete(sessionId);
};

// Convert conversation history to LangChain messages format
const formatMessagesForGemini = (history: ConversationEntry[]): BaseMessage[] => {
  return history.map(entry => {
    if (entry.role === 'user') {
      return new HumanMessage(entry.content);
    } else {
      return new AIMessage(entry.content);
    }
  });
};

const logError = (context: string, error: any) => {
  console.error(`=== ${context} ===`);
  console.error('Error type:', typeof error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  console.error('Full error object:', JSON.stringify(error, null, 2));
  console.error('=================');
};

// Enhanced function with conversation history
export const generateGeminiResponse = async (
  message: string, 
  sessionId?: string
): Promise<{ response: string; sessionId: string }> => {
  try {
    console.log('Starting Gemini response generation...');
    console.log('Input message:', message);
    console.log('Session ID:', sessionId);
    
    if (!message || message.trim().length === 0) {
      throw new Error("Message cannot be empty");
    }

    if (message.length > 8000) {
      throw new Error("Message too long");
    }

    // Use provided sessionId or generate new one
    const currentSessionId = sessionId || generateSessionId();
    
    // Get conversation history
    const conversationHistory = getConversationHistory(currentSessionId);
    console.log(`Retrieved ${conversationHistory.length} previous messages`);
    
    // Add current user message to history
    addToConversationHistory(currentSessionId, 'user', message);
    
    // Prepare messages for Gemini (including history + current message)
    const allMessages = formatMessagesForGemini([
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date() }
    ]);

    console.log('Calling Gemini API with conversation context...');
    console.log(`Total messages in context: ${allMessages.length}`);
    
    // Send conversation history to Gemini
    const response = await geminiModel.invoke(allMessages);
    console.log('Gemini response received');
    console.log('Response length:', response.content.length);
    
    const responseContent = response.content as string;
    
    // Add AI response to history
    addToConversationHistory(currentSessionId, 'assistant', responseContent);
    
    return {
      response: responseContent,
      sessionId: currentSessionId
    };
  } catch (error) {
    logError("Gemini Error", error);
    
    // Handle Gemini-specific errors
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error("Gemini quota exceeded. Please try again later.");
      }
      if (error.message.includes('API_KEY') || error.message.includes('authentication')) {
        throw new Error("Invalid Gemini API key configuration");
      }
      if (error.message.includes('SAFETY')) {
        throw new Error("Content blocked by Gemini safety filters");
      }
      if (error.message.includes('timeout')) {
        throw new Error("Request timeout - Gemini took too long to respond");
      }
      if (error.message.includes('BLOCKED')) {
        throw new Error("Content was blocked by Gemini's safety settings");
      }
    }
    
    throw new Error(`Gemini AI service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Function to get conversation history (for debugging or display)
export const getSessionHistory = (sessionId: string): ConversationEntry[] => {
  return getConversationHistory(sessionId);
};

// Function to clear a conversation
export const clearSession = (sessionId: string): void => {
  clearConversationHistory(sessionId);
};

// Function to get all active sessions (for debugging)
export const getActiveSessions = (): string[] => {
  return Array.from(conversationStore.keys());
};

// Test function with conversation context
export const testGeminiConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Testing Gemini connection...');
    
    const testResponse = await geminiModel.invoke("Say 'Hello World' and confirm you are Google Gemini");
    
    return {
      success: true,
      message: `Connection successful. Response: ${testResponse.content}`
    };
  } catch (error) {
    logError("Gemini Connection Test Error", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown connection error'
    };
  }
};