import { GoogleGenerativeAI } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");
  _client = new GoogleGenerativeAI(apiKey);
  return _client;
}

export function getModel(): string {
  return "gemini-1.5-flash";
}

export function isAIConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
