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
   * Send message to Llama API
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    language: 'en' | 'tr' = 'en'
  ): Promise<ChatResponse> {
    try {
      // Check if question is Shiffy-related
      if (!this.isShiffyRelated(userMessage)) {
        return {
          message: this.getOutOfScopeResponse(language)
        };
      }

      // Prepare messages for API
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Call Llama API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract message from response (adjust based on your API's response format)
      const assistantMessage = data.choices?.[0]?.message?.content 
        || data.response 
        || data.message
        || "I apologize, but I couldn't generate a response. Please try again.";

      return {
        message: assistantMessage
      };

    } catch (error) {
      console.error('Chat service error:', error);
      
      return {
        message: language === 'en' 
          ? "I'm having trouble connecting right now. Please try again in a moment. 🔄"
          : "Şu anda bağlantı kurmakta sorun yaşıyorum. Lütfen bir dakika sonra tekrar deneyin. 🔄",
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
