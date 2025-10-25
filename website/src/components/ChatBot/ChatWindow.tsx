import { useState, useRef, useEffect } from "react";
import { X, Send, Minimize2, Sparkles } from "lucide-react";
import shiffyCharacter from "@/assets/Shiffy (4).png";
import metaLogo from "@/assets/Shiffy (1).png";
import { useLanguage } from "@/contexts/LanguageContext";
import { chatService, ChatMessage as APIChatMessage } from "@/services/chatbot/chatService";
import { EXAMPLE_QUESTIONS } from "@/services/chatbot/prompts";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

const ChatWindow = ({ isOpen, onClose, onMinimize }: ChatWindowProps) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<APIChatMessage[]>([]);
  const [lastSentTime, setLastSentTime] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Constants from documentation
  const MAX_HISTORY_MESSAGES = 6; // Last 3 conversation pairs
  const MAX_MESSAGE_LENGTH = 500;
  const MIN_DELAY_MS = 2000; // 2 seconds between messages

  // Configure chat service from environment variables
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_LLAMA_API_URL || import.meta.env.VITE_API_URL || '';
    const apiKey = import.meta.env.VITE_LLAMA_API_KEY || '';
    if (apiUrl) {
      chatService.configure(apiUrl, apiKey);
    }
  }, []);

  const content = {
    en: {
      title: "Shiffy AI Assistant",
      subtitle: "Powered by Meta Llama AI",
      placeholder: "Ask me about Shiffy...",
      welcomeMessage: "👋 Hi! I'm Shiffy AI Assistant, powered by Meta Llama AI. I'm here to help you understand how Shiffy works and answer your questions about our AI-powered shift management system. How can I help you today?",
      scopeMessage: "I can only answer questions about Shiffy and our shift management platform. For other topics, please visit our website or contact support.",
      typing: "AI is thinking...",
      aiAssistant: "AI Assistant",
      tryAsking: "Try asking:",
      clearChat: "Clear Chat",
      rateLimitMessage: "Please wait at least 2 seconds between messages.",
    },
    tr: {
      title: "Shiffy AI Asistan",
      subtitle: "Meta Llama Yapay Zeka Destekli",
      placeholder: "Shiffy hakkında sorun...",
      welcomeMessage: "👋 Merhaba! Ben Shiffy AI Asistanı, Meta Llama yapay zekası ile destekleniyorum. Shiffy'nin nasıl çalıştığını anlamanıza ve yapay zeka destekli vardiya yönetim sistemimiz hakkındaki sorularınızı yanıtlamaya hazırım. Size nasıl yardımcı olabilirim?",
      scopeMessage: "Sadece Shiffy ve vardiya yönetim platformumuz hakkındaki soruları yanıtlayabilirim. Diğer konular için lütfen web sitemizi ziyaret edin veya destek ekibimizle iletişime geçin.",
      typing: "Yapay zeka düşünüyor...",
      aiAssistant: "AI Asistan",
      tryAsking: "Şunları sorabilirsiniz:",
      clearChat: "Sohbeti Temizle",
      rateLimitMessage: "Lütfen mesajlar arasında en az 2 saniye bekleyin.",
    }
  };

  const t = content[language];

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          text: t.welcomeMessage,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, t.welcomeMessage]);

  // Update welcome message when language changes
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === "welcome") {
      setMessages((prev) => [
        {
          ...prev[0],
          text: t.welcomeMessage,
        },
        ...prev.slice(1),
      ]);
    }
  }, [language, t.welcomeMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Rate limiting: minimum delay between messages
    const now = Date.now();
    if (now - lastSentTime < MIN_DELAY_MS) {
      const rateLimitMsg: Message = {
        id: `rate-${now}`,
        text: t.rateLimitMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, rateLimitMsg]);
      return;
    }
    setLastSentTime(now);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Prepare sliding-window history (last 6 messages = 3 pairs)
      const recentHistory = conversationHistory.slice(-MAX_HISTORY_MESSAGES);

      // Call the chat service with recent history
      const response = await chatService.sendMessage(
        userMessage.text,
        recentHistory,
        language
      );

      // Update conversation history with sliding window
      const newHistory: APIChatMessage[] = [
        ...conversationHistory,
        { role: 'user' as const, content: userMessage.text },
        { role: 'assistant' as const, content: response.message }
      ].slice(-MAX_HISTORY_MESSAGES); // Keep only last 6 messages
      
      setConversationHistory(newHistory);

      // Add bot response to messages
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to quick response if API fails
      const fallbackResponse = chatService.getQuickResponse(userMessage.text, language);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (question: string) => {
    setInputValue(question);
  };

  const handleClearChat = () => {
    setMessages([{
      id: "welcome",
      text: t.welcomeMessage,
      sender: "bot",
      timestamp: new Date(),
    }]);
    setConversationHistory([]);
    setLastSentTime(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] flex flex-col bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="gradient-primary p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={shiffyCharacter} alt="Shiffy" className="w-16 h-16 object-contain" />
          <div>
            <h3 className="text-white font-bold text-lg">{t.title}</h3>
            <div className="flex items-center gap-1.5">
              <img src={metaLogo} alt="Meta" className="w-3.5 h-3.5" />
              <p className="text-white/80 text-xs">{t.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="text-white/80 hover:text-white transition-colors text-xs px-2 py-1 rounded-lg hover:bg-white/10"
              aria-label={t.clearChat}
            >
              {t.clearChat}
            </button>
          )}
          <button
            onClick={onMinimize}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Minimize"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "bg-white border border-border text-foreground"
              }`}
            >
              {message.sender === "bot" && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{t.aiAssistant}</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Example questions - shown when no messages */}
        {messages.length === 1 && (
          <div className="space-y-2 mt-4">
            <p className="text-xs text-muted-foreground text-center mb-3">{t.tryAsking}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {EXAMPLE_QUESTIONS[language].slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(question)}
                  className="text-xs bg-white border border-border hover:border-primary/50 text-foreground px-3 py-2 rounded-lg transition-all hover:shadow-md"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                <span className="text-xs text-muted-foreground">{t.typing}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            className="flex-1 resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32 min-h-[44px]"
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="gradient-primary text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {/* Character count display when approaching limit */}
        {inputValue.length > 400 && (
          <div className="text-xs text-muted-foreground text-right mt-1">
            {inputValue.length}/{MAX_MESSAGE_LENGTH}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
