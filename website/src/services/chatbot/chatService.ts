import { SYSTEM_PROMPT, OUT_OF_SCOPE_RESPONSES } from './prompts';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

class ChatService {
  private apiUrl: string = ''; // Will be set from environment or props
  private apiKey: string = ''; // Will be set from environment or props
  
  /**
   * Configure the chat service with API credentials
   */
  configure(apiUrl: string, apiKey: string = '') {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Map API errors to user-friendly messages
   */
  private handleApiError(error: any, language: 'en' | 'tr' = 'en'): string {
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('429') || error.status === 429) {
      return language === 'en'
        ? 'Too many requests. Please wait a minute and try again. ⏱️'
        : 'Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyin. ⏱️';
    }
    
    if (errorMessage.includes('400') || error.status === 400) {
      return language === 'en'
        ? 'Your message is invalid or too long. Please try a shorter message. ✏️'
        : 'Mesajınız geçersiz veya çok uzun. Lütfen daha kısa bir mesaj deneyin. ✏️';
    }
    
    if (errorMessage.includes('500') || errorMessage.includes('503') || error.status >= 500) {
      return language === 'en'
        ? 'Server error. Please try again later. 🔧'
        : 'Sunucu hatası. Lütfen daha sonra tekrar deneyin. 🔧';
    }
    
    if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
      return language === 'en'
        ? 'Connection error. Please check your internet connection. 🌐'
        : 'Bağlantı hatası. İnternet bağlantınızı kontrol edin. 🌐';
    }
    
    return language === 'en'
      ? "I'm having trouble connecting right now. Please try again in a moment. 🔄"
      : "Şu anda bağlantı kurmakta sorun yaşıyorum. Lütfen bir dakika sonra tekrar deneyin. 🔄";
  }

  /**
   * Check if the question is related to Shiffy
   */
  private isShiffyRelated(question: string): boolean {
    const shiffyKeywords = [
      'shiffy', 'shift', 'schedule', 'vardiya', 'planlama',
      'çalışan', 'employee', 'manager', 'yönetici',
      'availability', 'müsaitlik', 'app', 'uygulama',
      'ai', 'yapay zeka', 'llama', 'meta',
      'how', 'nasıl', 'what', 'nedir', 'why', 'neden',
      'feature', 'özellik', 'benefit', 'avantaj',
      'time', 'zaman', 'save', 'tasarruf',
    ];

    const lowerQuestion = question.toLowerCase();
    return shiffyKeywords.some(keyword => lowerQuestion.includes(keyword));
  }

  /**
   * Get out of scope response
   */
  private getOutOfScopeResponse(language: 'en' | 'tr' = 'en'): string {
    const responses = OUT_OF_SCOPE_RESPONSES[language];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Send message to Shiffy Chatbot API
   * API Format (from documentation):
   * POST /chatbot/chat
   * Body: { message: string, history?: Array<{role, content}> }
   * Response: { success: boolean, data?: { message: string }, error?: string }
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    language: 'en' | 'tr' = 'en'
  ): Promise<ChatResponse> {
    try {
      // Check if API is configured
      if (!this.apiUrl) {
        console.warn('API URL not configured, using quick response');
        return {
          message: this.getQuickResponse(userMessage, language)
        };
      }

      console.log('🔍 ChatService Debug:', {
        apiUrl: this.apiUrl,
        hasApiKey: !!this.apiKey,
        message: userMessage,
        historyLength: conversationHistory.length
      });

      // Don't filter messages - let AI handle all questions
      // AI backend has system prompt to guide responses

      // Prepare history in the format expected by Shiffy API
      // Only include user/assistant messages (no system prompt in history)
      const history = conversationHistory
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const requestBody = {
        message: userMessage,
        history: history.length > 0 ? history : undefined,
        system_prompt: SYSTEM_PROMPT, // Send custom system prompt
      };

      console.log('📤 API Request:', requestBody);

      // Call RunPod Chatbot API via Vite proxy
      // Development: /api/runpod/api/chatbot (proxied by Vite)
      // Production: Direct HTTPS call (CORS must be handled)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Only add x-api-key if calling RunPod directly (not via proxy)
      if (this.apiKey && !this.apiUrl.startsWith('/api/runpod')) {
        headers['x-api-key'] = this.apiKey;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Data:', errorData);
        throw Object.assign(new Error(errorData.detail || errorData.error || `API Error: ${response.status}`), { status: response.status });
      }

      const data = await response.json();
      console.log('✅ API Response Data:', data);

      // Handle RunPod API response format
      // Response: { success: true, message: "AI response", model: "...", done: true }
      if (data.success && data.message) {
        return {
          message: data.message
        };
      } else if (data.message) {
        // Some responses might not have success field
        return {
          message: data.message
        };
      } else if (data.detail) {
        throw new Error(data.detail);
      }

      // Fallback if response format is unexpected
      return {
        message: language === 'en'
          ? "I received an unexpected response. Please try again."
          : "Beklenmeyen bir yanıt aldım. Lütfen tekrar deneyin."
      };

    } catch (error) {
      console.error('💥 Chat service error:', error);
      
      return {
        message: this.handleApiError(error, language),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get quick responses for common questions (fallback when API is not available)
   */
  getQuickResponse(question: string, language: 'en' | 'tr' = 'en'): string {
    const lowerQuestion = question.toLowerCase();

    const responses = {
      en: {
        what: "Shiffy is an AI-powered shift management platform that helps businesses with part-time employees automatically create fair, optimized schedules. It saves managers 90% of their scheduling time! ✨",
        how: "Shiffy uses Meta Llama AI to analyze employee availability, business needs, and preferences to automatically generate optimized shift schedules in seconds. Managers input requirements, employees set availability, and our AI does the rest! 🤖",
        benefit: "Shiffy saves 90% of scheduling time, achieves 95% team satisfaction, eliminates scheduling conflicts, and reduces employee turnover by 40%. It's a complete game-changer for shift management! 📊",
        employee: "Yes! Employees can easily set their availability and preferences through our mobile app. The AI considers these when creating schedules, leading to happier, more satisfied teams. 📱",
        mobile: "Absolutely! Shiffy is built with React Native, so both managers and employees get native mobile apps for iOS and Android. Manage shifts anywhere, anytime! 📱",
        price: "Shiffy is currently in development as part of the Meta & YTU Llama Hackathon 2025. For pricing and availability, please contact us through the website! 💰",
      },
      tr: {
        what: "Shiffy, part-time çalışanları olan işletmelerin otomatik olarak adil ve optimize edilmiş vardiya programları oluşturmasına yardımcı olan yapay zeka destekli bir vardiya yönetim platformudur. Yöneticilerin planlama süresinin %90'ını tasarruf ediyor! ✨",
        how: "Shiffy, Meta Llama yapay zekasını kullanarak çalışan müsaitliğini, iş ihtiyaçlarını ve tercihlerini analiz ederek saniyeler içinde optimize edilmiş vardiya programları oluşturur. Yöneticiler gereksinimleri girer, çalışanlar müsaitliklerini belirler ve yapay zekamız gerisini halleder! 🤖",
        benefit: "Shiffy, planlama süresinin %90'ını tasarruf eder, %95 ekip memnuniyeti sağlar, planlama çakışmalarını ortadan kaldırır ve personel devir hızını %40 azaltır. Vardiya yönetimi için tam bir oyun değiştirici! 📊",
        employee: "Evet! Çalışanlar mobil uygulamamız üzerinden kolayca müsaitlik ve tercihlerini belirleyebilirler. Yapay zeka, programları oluştururken bunları dikkate alır ve daha mutlu, daha memnun ekipler sağlar. 📱",
        mobile: "Kesinlikle! Shiffy, React Native ile geliştirildiği için hem yöneticiler hem de çalışanlar iOS ve Android için yerel mobil uygulamalara sahiptir. Vardiyalarınızı her yerden, her zaman yönetin! 📱",
        price: "Shiffy şu anda Meta & YTÜ Llama Hackathon 2025 kapsamında geliştirilme aşamasındadır. Fiyatlandırma ve kullanılabilirlik için lütfen web sitesi üzerinden bizimle iletişime geçin! 💰",
      }
    };

    const langResponses = responses[language];

    for (const [key, response] of Object.entries(langResponses)) {
      if (lowerQuestion.includes(key)) {
        return response;
      }
    }

    // Default response
    return language === 'en'
      ? "Shiffy is an AI-powered shift management platform that saves time and makes scheduling fair and easy. What specific aspect would you like to know more about? 😊"
      : "Shiffy, zaman kazandıran ve planlamayı adil ve kolay hale getiren yapay zeka destekli bir vardiya yönetim platformudur. Hangi konuda daha fazla bilgi edinmek istersiniz? 😊";
  }
}

// Export singleton instance
export const chatService = new ChatService();
