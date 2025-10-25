# 🤖 Shiffy AI Chatbot

Modern, yapay zeka destekli chatbot sistemi - Shiffy için özel geliştirilmiş.

## ✨ Özellikler

### 🎨 Tasarım
- ✅ Modern, minimalist arayüz
- ✅ Sayfanın sağ alt köşesinde floating button
- ✅ Shiffy logolu özel buton tasarımı
- ✅ Animasyonlu açılma/kapanma
- ✅ Pulse efekti (dikkat çekici)
- ✅ Responsive tasarım (mobil uyumlu)
- ✅ Proje renk temasına uyumlu

### 🧠 Akıllı Özellikler
- ✅ Meta Llama AI entegrasyonu
- ✅ Kapsam dışı soru filtreleme
- ✅ Türkçe/İngilizce çoklu dil desteği
- ✅ Konuşma geçmişi yönetimi
- ✅ Yazıyor göstergesi (typing indicator)
- ✅ Örnek sorular
- ✅ Fallback yanıtlar (API olmadan da çalışır)

### 💬 Chatbot Yetenekleri
Chatbot **SADECE** şu konularda yardımcı olur:
- Shiffy'nin ne olduğu
- Nasıl çalıştığı
- Özellikleri ve avantajları
- Fiyatlandırma
- Kullanım senaryoları
- Teknik detaylar

**Kapsam dışı sorulara cevap vermez!**

## 📁 Dosya Yapısı

```
src/
├── components/
│   └── ChatBot/
│       ├── index.tsx          # Ana chatbot wrapper
│       ├── ChatButton.tsx     # Floating chat butonu
│       └── ChatWindow.tsx     # Chat penceresi
└── services/
    └── chatbot/
        ├── chatService.ts     # API servisi
        └── prompts.ts         # System promptlar
```

## 🚀 Hızlı Başlangıç

### 1. API Konfigürasyonu

`.env` dosyası oluşturun:

```bash
cp .env.example .env
```

API bilgilerinizi ekleyin:

```env
VITE_LLAMA_API_URL=http://your-server:port/api/chat
VITE_LLAMA_API_KEY=your-api-key
VITE_CHATBOT_ENABLED=true
```

### 2. Kullanım

Chatbot otomatik olarak sayfaya eklendi! Hiçbir ek işlem gerekmez.

## 🎯 Nasıl Çalışır?

### 1. Kullanıcı Akışı

```
Kullanıcı butona tıklar
    ↓
Chat penceresi açılır
    ↓
Hoş geldin mesajı gösterilir
    ↓
Kullanıcı soru sorar
    ↓
Kapsam kontrolü yapılır
    ↓
API'ye gönderilir (veya fallback)
    ↓
Yanıt gösterilir
```

### 2. Kapsam Kontrolü

```typescript
// Shiffy ile ilgili mi?
if (includes('shiffy', 'shift', 'vardiya', ...)) {
  → API'ye gönder
} else {
  → "Kapsam dışı" yanıtı ver
}
```

### 3. API Entegrasyonu

```typescript
// Request
POST /api/chat
{
  "messages": [...],
  "temperature": 0.7,
  "max_tokens": 500
}

// Response
{
  "choices": [{
    "message": {
      "content": "Yanıt..."
    }
  }]
}
```

## 📝 Prompt Sistemi

### System Prompt
Chatbot'un davranışı detaylı bir system prompt ile kontrol edilir:
- Sadece Shiffy hakkında konuşur
- Profesyonel ve yardımsever
- Kısa ve öz yanıtlar (2-4 cümle)
- Emoji kullanır ✨

### Örnek Sorular

**İngilizce:**
- "What is Shiffy?"
- "How does AI scheduling work?"
- "What are the benefits?"

**Türkçe:**
- "Shiffy nedir?"
- "AI planlama nasıl çalışır?"
- "Avantajları neler?"

## 🎨 Tasarım Detayları

### Chat Butonu
- 🎯 Sağ alt köşe (fixed position)
- 📏 64x64px (logo + padding)
- 🌈 Gradient background (primary → accent)
- ✨ Pulse animasyonu
- 🎭 Hover efekti (scale 1.1)

### Chat Penceresi
- 📐 400x600px (responsive)
- 🎨 Gradient header (Shiffy renkleri)
- 💬 Mesaj baloncukları
  - Kullanıcı: Gradient (primary → accent)
  - Bot: Beyaz + border
- ⌨️ Modern input area
- 📱 Mobil uyumlu

## 🔧 Özelleştirme

### Logo Değiştirme

```tsx
// ChatButton.tsx
import customLogo from "@/assets/your-logo.png";
```

### Renk Teması

Otomatik olarak projenizin Tailwind temasını kullanır:
```tsx
className="gradient-primary" // primary → accent
className="text-foreground"  // Ana metin rengi
className="bg-muted/20"      // Arka plan
```

### Prompt Düzenleme

```typescript
// src/services/chatbot/prompts.ts
export const SYSTEM_PROMPT = `
  Your custom system prompt here...
`;
```

## 🧪 Test

### Test Soruları (İçinde kalmalı)
✅ "Shiffy nedir?"
✅ "Nasıl çalışır?"
✅ "Avantajları neler?"
✅ "Fiyatı ne kadar?"

### Test Soruları (Dışında kalmalı)
❌ "Hava durumu nasıl?"
❌ "En iyi pizza tarifi?"
❌ "Python öğrenmek istiyorum"

## 📱 Mobil Uyumluluk

- ✅ Responsive boyutlar
- ✅ Touch friendly butonlar
- ✅ Mobilde ekranı kapatmaz
- ✅ Keyboard handling
- ✅ Auto-scroll mesajlarda

## 🐛 Sorun Giderme

### Chatbot görünmüyor
```bash
# .env dosyasını kontrol edin
VITE_CHATBOT_ENABLED=true

# Sayfayı yenileyin
```

### API çalışmıyor
```typescript
// Console loglarını kontrol edin
// Fallback yanıtlar kullanılıyor olabilir
```

### Stil bozuk
```bash
# Tailwind rebuild
npm run build
```

## 📚 Detaylı Dökümanlar

- 📖 [API Entegrasyon Rehberi](./CHATBOT_API_GUIDE.md)
- 🎨 [Tasarım Kılavuzu](./DESIGN_GUIDE.md) (opsiyonel)
- 🔧 [Geliştirici Dökümanları](./DEV_DOCS.md) (opsiyonel)

## 🎯 Sonraki Adımlar

1. ✅ Tasarım ve UI oluşturuldu
2. ✅ Prompt sistemi hazır
3. ✅ API servisi hazır
4. ⏳ API endpoint'inizi ekleyin
5. ⏳ Test edin
6. ⏳ Production'a alın

## 💡 İpuçları

- API olmadan da test edebilirsiniz (fallback yanıtlar var)
- Önce tasarımı test edin
- Sonra API'yi entegre edin
- System prompt'u ihtiyacınıza göre düzenleyin
- Rate limiting eklemeyi unutmayın

## 🤝 Katkıda Bulunma

1. API formatını projenize göre düzenleyin
2. System prompt'u zenginleştirin
3. Daha fazla örnek soru ekleyin
4. Yeni diller ekleyin (opsiyonel)

## 📄 Lisans

Shiffy projesi için geliştirilmiştir.
Meta & YTU Llama Hackathon 2025

---

**Powered by Meta Llama AI** 🦙✨
