import express from "express";
import { chatWithAI, testGeminiAPI } from "../controllers/aiController";
import { verifyToken } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting for Gemini (more generous since it's free)
const geminiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Higher limit since Gemini is more generous
  message: {
    error: "Too many AI requests, please try again later.",
    code: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateChatInput: express.RequestHandler = (req, res, next) => {
  const { message } = req.body;
  
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({
      error: "Valid message is required",
      code: "INVALID_INPUT"
    });
    return;
  }
  
  next();
};

// Helper to wrap async route handlers
const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Routes
router.get("/test-gemini", asyncHandler(testGeminiAPI)); // Test endpoint
router.post("/chat", 
  geminiRateLimit,
  verifyToken, // Add back when ready
  validateChatInput,
  asyncHandler(chatWithAI)
);

export default router;

// package.json dependencies you need to add:
/*
{
  "dependencies": {
    "@langchain/google-genai": "^0.0.25",
    "@google/generative-ai": "^0.15.0"
  }
}
*/

// .env file setup:
/*
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=your_gemini_api_key_here

# Remove or comment out OpenAI key if not using
# OPENAI_API_KEY=your_openai_key
*/