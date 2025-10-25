# Shiffy Chatbot - API Entegrasyon Rehberi

Bu döküman, Shiffy chatbot'unun Llama AI modeli ile nasıl entegre edileceğini açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [API Konfigürasyonu](#api-konfigürasyonu)
3. [Chatbot Mimarisi](#chatbot-mimarisi)
4. [API Entegrasyonu](#api-entegrasyonu)
5. [Prompt Sistemi](#prompt-sistemi)
6. [Test ve Debugging](#test-ve-debugging)

## 🎯 Genel Bakış

Shiffy chatbot'u şu özelliklerle gelir:

- ✅ Modern, responsive tasarım
- ✅ Türkçe/İngilizce çoklu dil desteği
- ✅ Meta Llama AI entegrasyonu hazır
- ✅ Kapsam dışı soru filtreleme
- ✅ Konuşma geçmişi yönetimi
- ✅ Fallback yanıtlar (API kullanılamadığında)
- ✅ Örnek sorular

## ⚙️ API Konfigürasyonu

### 1. Environment Variables

`.env` dosyası oluşturun (`.env.example` dosyasını kopyalayın):

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Llama API endpoint'iniz
VITE_LLAMA_API_URL=http://your-server:port/api/chat

# API key (gerekiyorsa)
VITE_LLAMA_API_KEY=your-api-key

# Chatbot'u aktif/pasif yapma
VITE_CHATBOT_ENABLED=true
```

### 2. ChatWindow Konfigürasyonu

`src/components/ChatBot/ChatWindow.tsx` dosyasında API'yi yapılandırın:

```typescript
useEffect(() => {
  chatService.configure(
    import.meta.env.VITE_LLAMA_API_URL,
    import.meta.env.VITE_LLAMA_API_KEY
  );
}, []);
```

## 🏗️ Chatbot Mimarisi

### Dosya Yapısı

```
src/
├── components/
│   └── ChatBot/
│       ├── index.tsx          # Ana chatbot komponenti
│       ├── ChatButton.tsx     # Floating chat butonu
│       └── ChatWindow.tsx     # Chat penceresi UI
└── services/
    └── chatbot/
        ├── chatService.ts     # API servisi
        └── prompts.ts         # System promptlar ve ayarlar
```

### Bileşen Hiyerarşisi

```
ChatBot (index.tsx)
├── ChatButton (Floating button)
└── ChatWindow (Chat interface)
    ├── Header (Title, minimize, close)
    ├── Messages (Chat history)
    ├── Example Questions
    └── Input (Text area + send button)
```

## 🔌 API Entegrasyonu

### Beklenen API Formatı

Chatbot'unuz şu formatta API çağrısı yapar:

**Request:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are Shiffy Assistant..."
    },
    {
      "role": "user",
      "content": "Shiffy nedir?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500,
  "top_p": 0.9
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Shiffy, yapay zeka destekli bir vardiya yönetim platformudur..."
      }
    }
  ]
}
```

### Alternatif Response Formatları

Eğer API'niz farklı format dönüyorsa, `chatService.ts` dosyasında bu kısmı düzenleyin:

```typescript
// chatService.ts içinde
const assistantMessage = data.choices?.[0]?.message?.content  // OpenAI format
  || data.response                                             // Custom format
  || data.message                                              // Simple format
  || "Default error message";
```

### API Örneği (Express.js)

```javascript
// server.js
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, temperature, max_tokens } = req.body;
    
    // Llama modelinize request gönderin
    const response = await llamaModel.generate({
      messages,
      temperature,
      max_tokens,
    });
    
    res.json({
      choices: [{
        message: {
          role: 'assistant',
          content: response.text
        }
      }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 📝 Prompt Sistemi

### System Prompt

Chatbot'un davranışı `src/services/chatbot/prompts.ts` dosyasındaki `SYSTEM_PROMPT` ile kontrol edilir.

**Ana Kurallar:**
- ✅ Sadece Shiffy hakkında konuşur
- ✅ Kapsam dışı soruları nazikçe reddeder
- ✅ Profesyonel ve yardımsever
- ✅ 2-4 cümlelik kısa yanıtlar
- ✅ Emoji kullanımı (✨, 📱, 👍, vb.)

### Kapsam Kontrolü

Chatbot otomatik olarak kapsam dışı soruları filtreler:

```typescript
private isShiffyRelated(question: string): boolean {
  const keywords = ['shiffy', 'shift', 'schedule', 'vardiya', ...];
  return keywords.some(k => question.toLowerCase().includes(k));
}
```

### Fallback Yanıtlar

API kullanılamazsa, önceden tanımlı yanıtlar kullanılır:

```typescript
chatService.getQuickResponse(question, language);
```

## 🧪 Test ve Debugging

### 1. Konsol Logları

API çağrılarını izlemek için:

```typescript
// chatService.ts içinde
console.log('Sending to API:', messages);
console.log('API Response:', data);
```

### 2. Test Soruları

**İngilizce:**
- "What is Shiffy?"
- "How does AI scheduling work?"
- "What are the benefits?"
- "Can employees set availability?"

**Türkçe:**
- "Shiffy nedir?"
- "AI planlama nasıl çalışır?"
- "Avantajları neler?"
- "Çalışanlar müsaitlik belirleyebilir mi?"

### 3. Kapsam Dışı Test

Şu soruları sorun (reddedilmeli):
- "What's the weather?"
- "Who is the president?"
- "Tell me a joke"

### 4. API Mock Response

Geliştirme sırasında mock yanıt kullanmak için:

```typescript
// chatService.ts içinde sendMessage metodunu değiştirin
async sendMessage(...) {
  // Geliştirme için mock response
  if (import.meta.env.DEV) {
    return {
      message: this.getQuickResponse(userMessage, language)
    };
  }
  
  // Normal API çağrısı...
}
```

## 🎨 Özelleştirme

### Renk Teması

Chatbot otomatik olarak projenizin tailwind temasını kullanır:
- `primary` ve `accent` gradyanları
- `foreground` ve `background` renkleri
- `muted` ve `border` renkleri

### Logo Değiştirme

```tsx
// ChatButton.tsx ve ChatWindow.tsx içinde
import customLogo from "@/assets/your-logo.png";
```

### Mesaj Limiti

```typescript
// ChatWindow.tsx içinde
const MAX_MESSAGES = 50; // Mesaj geçmişi limiti
```

## 🚀 Production Checklist

- [ ] `.env` dosyası doğru API bilgileriyle dolduruldu
- [ ] API endpoint erişilebilir ve test edildi
- [ ] CORS ayarları yapıldı
- [ ] Rate limiting kontrol edildi
- [ ] Error handling test edildi
- [ ] Mobil responsive test edildi
- [ ] Türkçe/İngilizce çeviriler kontrol edildi
- [ ] System prompt gözden geçirildi

## 📞 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Network tab'de API çağrılarını inceleyin
3. `.env` dosyasının doğru yüklendiğini kontrol edin
4. API endpoint'inizi Postman ile test edin

## 🔄 Güncelleme Notları

**Versiyon 1.0.0**
- İlk sürüm
- Meta Llama AI desteği
- Çoklu dil desteği
- Kapsam kontrolü
- Fallback yanıtlar
