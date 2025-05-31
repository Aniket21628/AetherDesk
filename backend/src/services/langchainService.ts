import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

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
  model: "gemini-2.0-flash", // Free tier model
  temperature: 0.7,
  maxOutputTokens: 1000,
  // Gemini specific settings with proper enum values
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

const logError = (context: string, error: any) => {
  console.error(`=== ${context} ===`);
  console.error('Error type:', typeof error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  console.error('Full error object:', JSON.stringify(error, null, 2));
  console.error('=================');
};

export const generateGeminiResponse = async (message: string): Promise<string> => {
  try {
    console.log('Starting Gemini response generation...');
    console.log('Input message:', message);
    
    if (!message || message.trim().length === 0) {
      throw new Error("Message cannot be empty");
    }

    if (message.length > 8000) { // Gemini has higher token limits
      throw new Error("Message too long");
    }

    console.log('Calling Gemini API...');
    const response = await geminiModel.invoke(message);
    console.log('Gemini response received');
    console.log('Response length:', response.content.length);
    
    return response.content as string;
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

// Test function to verify Gemini API connection
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