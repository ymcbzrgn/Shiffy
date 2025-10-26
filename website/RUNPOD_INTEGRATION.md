# 🚀 Shiffy Website - RunPod AI Integration

## 📍 RunPod Endpoint Bilgileri

### Base URL
```
https://3fg3p55cngmmn1-8888.proxy.runpod.net
```

### Available Endpoints

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|---------------|
| `/health` | GET | Health check | <1s |
| `/api/generate-schedule` | POST | AI schedule generation | 5-15s |
| `/api/chatbot` | POST | RAG-powered chatbot | 3-8s |

---

## ✅ Entegrasyon Tamamlandı

### Güncellenmiş Dosyalar

#### 1. `vite.config.ts` - Proxy Configuration
```typescript
proxy: {
  '/api/runpod': {
    target: 'https://3fg3p55cngmmn1-8888.proxy.runpod.net',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/runpod/, ''),
  },
}
```

**Amaç:** Development sırasında CORS sorunlarını bypass etmek için Vite proxy kullanıyoruz.

#### 2. `.env` - Environment Variables
```bash
# Vite proxy üzerinden bağlanıyoruz
VITE_LLAMA_API_URL=/api/runpod/api/chatbot
```

**Nasıl Çalışır:**
- Frontend: `/api/runpod/api/chatbot` çağırır
- Vite proxy: Bunu `https://3fg3p55cngmmn1-8888.proxy.runpod.net/api/chatbot` yönlendirir

#### 3. `functions/chatbot.js` - Netlify Serverless Function
```javascript
const response = await fetch('https://3fg3p55cngmmn1-8888.proxy.runpod.net/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: message,
    history: history || [],
  }),
});
```

**Not:** Production'da (Netlify) doğrudan RunPod endpoint'e bağlanır.

---

## 🎯 API Request/Response Format

### Chatbot Request
```json
{
  "query": "Shiffy nedir?",
  "history": [
    {
      "role": "user",
      "content": "Merhaba"
    },
    {
      "role": "assistant",
      "content": "Merhaba! Size nasıl yardımcı olabilirim?"
    }
  ]
}
```

### Chatbot Response
```json
{
  "success": true,
  "response": "Shiffy, AI destekli vardiya planlama uygulamasıdır.",
  "sources": ["Doc1.md", "Doc2.md", "Doc3.md"]
}
```

---

## 🧪 Test Etme

### 1. Development (Local)

```bash
# Website klasöründe
npm run dev
```

Tarayıcıda `http://localhost:8080` açın ve chatbot'u test edin.

**Akış:**
1. Frontend → `/api/runpod/api/chatbot` (Vite proxy)
2. Vite Proxy → `https://3fg3p55cngmmn1-8888.proxy.runpod.net/api/chatbot`
3. RunPod AI → Response döner

### 2. Terminal Test

```powershell
# Health check
curl https://3fg3p55cngmmn1-8888.proxy.runpod.net/health

# Chatbot test
curl -X POST https://3fg3p55cngmmn1-8888.proxy.runpod.net/api/chatbot `
  -H "Content-Type: application/json" `
  -d '{"query": "Shiffy nedir?"}'
```

### 3. Browser Console Test

```javascript
// Website açıkken F12 > Console
fetch('/api/runpod/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Shiffy nedir?' })
})
.then(r => r.json())
.then(console.log)
```

---

## 🚨 Troubleshooting

### Problem: "Failed to fetch" Hatası

**Çözüm:**
1. RunPod pod'unun çalıştığını kontrol et
2. URL'nin doğru olduğunu kontrol et: `https://3fg3p55cngmmn1-8888.proxy.runpod.net`
3. Terminal'den health check yap: `curl https://3fg3p55cngmmn1-8888.proxy.runpod.net/health`

### Problem: CORS Hatası (Production)

**Çözüm:**
- Production'da Netlify serverless function kullanıyoruz (functions/chatbot.js)
- Bu function proxy görevi görür ve CORS sorununu çözer

### Problem: Timeout

**Normal:**
- Chatbot: 3-8 saniye
- Schedule generation: 5-15 saniye

**Çözüm:** Loading indicator göster, kullanıcıyı bilgilendir

---

## 📝 Deployment Checklist

### Development
- [x] `vite.config.ts` proxy yapılandırıldı
- [x] `.env` dosyası güncellendi
- [x] `chatService.ts` API formatı uyumlu
- [x] Loading states eklendi

### Production (Netlify)
- [x] `functions/chatbot.js` doğrudan RunPod'a bağlanıyor
- [x] CORS headers ayarlandı
- [x] Error handling yapıldı
- [ ] Environment variables Netlify dashboard'a eklendi (gerekirse)

---

## 🔄 URL Değişirse

Eğer RunPod URL değişirse (pod yeniden oluşturulursa):

### 1. `vite.config.ts`
```typescript
target: 'https://YENİ-URL-BURAYA.proxy.runpod.net',
```

### 2. `functions/chatbot.js`
```javascript
const response = await fetch('https://YENİ-URL-BURAYA.proxy.runpod.net/api/chatbot', {
```

### 3. `.env` ve `.env.example`
Yorumlarda URL'i güncelle.

---

## 🎉 Ready!

Website artık yeni RunPod endpoint'ine bağlı! Chatbot kullanıma hazır.

**Test için:**
1. `cd website`
2. `npm run dev`
3. `http://localhost:8080` açın
4. Chatbot ikonuna tıklayıp "Shiffy nedir?" sorun

---

**Son Güncelleme:** 26 Ekim 2025  
**RunPod Endpoint:** `https://3fg3p55cngmmn1-8888.proxy.runpod.net`
