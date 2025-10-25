// src/types/chatbot.types.ts
// TypeScript types for Shiffy Chatbot based on documentation

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotRequest {
  message: string;
  history?: ChatHistoryItem[];
}

export interface ChatbotResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
}

export interface ChatbotConfig {
  apiUrl: string;
  maxHistoryMessages: number;
  maxMessageLength: number;
  requestTimeout: number;
}
