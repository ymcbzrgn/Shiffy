# Shiffy Chatbot API Integration

## API Endpoint Configuration

The Shiffy chatbot uses the following API endpoint format based on the official documentation.

### Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Production API endpoint (Oracle Cloud)
VITE_API_URL=https://api.shiffy.com/chatbot/chat

# Development/Testing (uncomment to use local backend)
# VITE_API_URL=http://localhost:3000/chatbot/chat

# API Key (optional - backend uses IP-based rate limiting)
VITE_LLAMA_API_KEY=

# Chatbot Configuration
VITE_CHATBOT_ENABLED=true
VITE_MAX_HISTORY_MESSAGES=6
VITE_MAX_MESSAGE_LENGTH=500
VITE_RATE_LIMIT_DELAY_MS=2000
```

### API Request Format

**Endpoint:** `POST /chatbot/chat`

**Request Body:**
```json
{
  "message": "User's current message",
  "history": [
    {
      "role": "user",
      "content": "Previous user message"
    },
    {
      "role": "assistant",
      "content": "Previous AI response"
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "message": "AI's response message"
  }
}
```

**Response (Error - 400/429/500):**
```json
{
  "success": false,
  "error": "Error description"
}
```

### Features Implemented

✅ **Conversation Memory (Sliding Window)**
- Keeps last 6 messages (3 conversation pairs)
- Automatically trims old messages
- No database required - all in frontend state

✅ **Rate Limiting (Frontend)**
- Minimum 2 seconds between messages
- User-friendly warning message
- Prevents API spam

✅ **Error Handling**
- HTTP 400: Invalid/too long message
- HTTP 429: Too many requests
- HTTP 500: Server error
- Network errors: Connection issues
- All errors shown in Turkish/English

✅ **Character Limit**
- Maximum 500 characters per message
- Counter shown after 400 characters
- Prevents overly long inputs

✅ **Accessibility (ARIA)**
- Proper ARIA labels on all interactive elements
- Screen reader support
- Keyboard navigation friendly

✅ **Clear Chat**
- Button to reset conversation
- Clears messages and history
- Resets rate limiter

✅ **Debug Mode**
- Shows message count and history size
- Only in development mode
- Hidden in production builds

### Testing the API

#### 1. Using the UI
```bash
npm run dev
# Open http://localhost:8081
# Click chat button and start messaging
```

#### 2. Testing with cURL

**First message (no history):**
```bash
curl -X POST https://api.shiffy.com/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Shiffy nedir?"
  }'
```

**Second message (with history):**
```bash
curl -X POST https://api.shiffy.com/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Fiyatı ne kadar?",
    "history": [
      {"role": "user", "content": "Shiffy nedir?"},
      {"role": "assistant", "content": "Shiffy, AI destekli vardiya yönetim platformudur..."}
    ]
  }'
```

### Development vs Production

**Development (Local Backend):**
```env
VITE_API_URL=http://localhost:3000/chatbot/chat
```

**Production (Oracle Cloud):**
```env
VITE_API_URL=https://api.shiffy.com/chatbot/chat
```

### Troubleshooting

**Chatbot not responding?**
1. Check if `.env` file exists with `VITE_API_URL`
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Try the fallback quick responses (works offline)

**Rate limit errors?**
- Backend allows 20 requests per minute per IP
- Frontend enforces 2 second delay between messages
- Wait 60 seconds if you hit the limit

**CORS errors?**
- Backend must allow your domain in CORS headers
- For local development: `http://localhost:*`
- For production: `https://shiffy.com`

### Quick Response Fallback

If the API is unavailable, the chatbot automatically uses pre-programmed quick responses for common questions:
- What is Shiffy?
- How does it work?
- Benefits and features
- Employee features
- Mobile app
- Pricing

This ensures the chatbot remains functional even without backend connectivity.

### API Rate Limits

**Backend (from documentation):**
- 20 requests per minute per IP address
- Enforced server-side

**Frontend (implemented):**
- 2 second minimum delay between messages
- Prevents accidental spam
- User-friendly rate limit messages

### Support

For API issues or questions:
- Check documentation: `SHIFFY_CHATBOT_DOCUMENTATION.md`
- Contact backend team: Arke
- Discord: #shiffy-dev channel
