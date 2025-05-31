"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponse = void 0;
const openai_1 = require("@langchain/openai");
const model = new openai_1.OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
});
const generateResponse = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield model.call(prompt);
        return response;
    }
    catch (error) {
        console.error("LangChain error:", error);
        throw new Error("AI service failed");
    }
});
exports.generateResponse = generateResponse;
