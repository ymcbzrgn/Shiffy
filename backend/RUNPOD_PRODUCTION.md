# Shiffy Proxy API — Production Quickstart (Hackathon Edition)

**Project:** Shiffy - AI-Powered Shift Management System
**Environment:** Production (RunPod)
**Last Updated:** October 24, 2025

---

## Production Endpoint

**Base URL (public):** `https://ymgoqyxl58jzfo-8888.proxy.runpod.net`

**API Key (header value):** `eo2fXSAK6Mpq+27+KYtCfHKeHepqRD/tleFGFCNmkIVxC21c/iqmL0zNb3B/D+T/`

> All authorized requests must include **`x-api-key`** header with the exact value above.
> Use **`Content-Type: application/json`** for all requests.
> `/health` endpoint does NOT require authentication.

---

## Quick Test (cURL)

```bash
BASE='https://ymgoqyxl58jzfo-8888.proxy.runpod.net'
API='eo2fXSAK6Mpq+27+KYtCfHKeHepqRD/tleFGFCNmkIVxC21c/iqmL0zNb3B/D+T/'

# 1) Health check (no authentication required)
curl -s "$BASE/health"

# 2) Ollama passthrough (with authentication)
curl -s -H "x-api-key: $API" "$BASE/ollama/tags"

# 3) Minimal JSON generation test
curl -s -X POST "$BASE/api/generate-with-system" \
  -H "x-api-key: $API" -H "Content-Type: application/json" \
  -d '{
        "system_prompt_key":"shift_scheduler",
        "prompt":"Return exactly this JSON: {\"shifts\":[],\"summary\":{\"total_employees\":0,\"total_shifts\":0,\"hours_per_employee\":{},\"warnings\":[]}}",
        "model":"llama3.1:8b-instruct-q6_K",
        "stream":false,
        "validate":true,
        "options":{"num_ctx":2048,"num_predict":64,"temperature":0}
      }'
```

---

## Production Endpoints

### 1) `GET /health` (anonymous)

Returns service health status.

**Response:**
```json
{
  "status": "ok",
  "service": "shiffy-ollama-proxy"
}
```

---

### 2) `POST /api/generate-with-system` (auth: `x-api-key`)

Generate schedule with built-in system prompt and validation.

**Request Body (example):**
```json
{
  "system_prompt_key": "shift_scheduler",
  "prompt": "DATA...\n\nTASK: ...",
  "model": "llama3.1:8b-instruct-q6_K",
  "stream": false,
  "validate": true,
  "options": {
    "temperature": 0.5,
    "num_ctx": 16384,
    "num_predict": 2500
  }
}
```

**Response (success):**
```json
{
  "model": "llama3.1:8b-instruct-q6_K",
  "created_at": "2025-10-24T...",
  "response": "{\"shifts\":[...],\"summary\":{...}}",
  "done": true,
  "parsed": {
    "shifts": [...],
    "summary": {...}
  },
  "validation": {
    "ok": true
  }
}
```

---

### 3) `POST /api/generate-schedule-batch` (auth: `x-api-key`)

Generate schedule day-by-day with automatic retries and metrics.

**Request Body (example):**
```json
{
  "data": "<store + employee data (text or JSON)>",
  "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  "model": "llama3.1:8b-instruct-q6_K",
  "options": {
    "temperature": 0.5,
    "top_p": 0.9,
    "repeat_penalty": 1.1,
    "num_ctx": 16384,
    "num_predict": 3000,
    "num_thread": 8
  },
  "retries": 5
}
```

**Response Fields:**
- `parsed.shifts[]` - All shifts for the week
- `parsed.summary` - Total employees, shifts, hours per employee
- `metrics.chunks[]` - Per-day generation metrics (tokens, attempts)
- `validation.ok` - Schema validation status

---

### 4) `POST /api/validate-schedule` (auth: `x-api-key`)

Validate generated schedule against business rules.

**Request Body (example):**
```json
{
  "schedule": {
    "shifts": [...],
    "summary": {...}
  },
  "data": {
    "operating_hours": {
      "open": "08:00",
      "close": "23:00"
    },
    "min_coverage": 2,
    "slot_minutes": 30,
    "availability": null
  }
}
```

**Response:**
```json
{
  "ok": true,
  "errors": [],
  "warnings": ["Employee X has only 28h (below average)"],
  "fairness": {
    "avg_hours": 32.5,
    "violators": []
  }
}
```

---

### 5) `/{prefix}/ollama/*` (auth: `x-api-key`)

Passthrough to Ollama API for advanced use cases.

**Examples:**
- `GET /ollama/tags` - List available models
- `POST /ollama/generate` - Direct Ollama generation (streaming supported)

---

## Client Integration Examples

### Node.js (fetch)

```javascript
const BASE = 'https://ymgoqyxl58jzfo-8888.proxy.runpod.net';
const API = 'eo2fXSAK6Mpq+27+KYtCfHKeHepqRD/tleFGFCNmkIVxC21c/iqmL0zNb3B/D+T/';

const response = await fetch(`${BASE}/api/generate-with-system`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API
  },
  body: JSON.stringify({
    system_prompt_key: 'shift_scheduler',
    prompt: 'STORE: Example Store\nWEEK: 2025-10-28 to 2025-11-03\n\nEMPLOYEE 1: ...',
    model: 'llama3.1:8b-instruct-q6_K',
    stream: false,
    validate: true,
    options: {
      temperature: 0.5,
      num_ctx: 16384,
      num_predict: 2500
    }
  })
});

const data = await response.json();
console.log('Generated schedule:', data.parsed);
```

### Python (requests)

```python
import requests

BASE = 'https://ymgoqyxl58jzfo-8888.proxy.runpod.net'
API = 'eo2fXSAK6Mpq+27+KYtCfHKeHepqRD/tleFGFCNmkIVxC21c/iqmL0zNb3B/D+T/'

response = requests.post(
    f'{BASE}/api/generate-with-system',
    headers={
        'x-api-key': API,
        'Content-Type': 'application/json'
    },
    json={
        'system_prompt_key': 'shift_scheduler',
        'prompt': 'STORE: Example Store\nWEEK: 2025-10-28 to 2025-11-03\n\nEMPLOYEE 1: ...',
        'model': 'llama3.1:8b-instruct-q6_K',
        'stream': False,
        'validate': True,
        'options': {
            'temperature': 0.5,
            'num_ctx': 16384,
            'num_predict': 2500
        }
    }
)

data = response.json()
print('Generated schedule:', data['parsed'])
```

### TypeScript (Backend Service)

```typescript
// src/services/llama.service.ts
import { config } from '../config/env.config';

export const llamaService = {
  async generateSchedule(
    storeName: string,
    weekStart: string,
    employees: any[]
  ): Promise<any> {
    const prompt = buildSchedulePrompt(storeName, weekStart, employees);

    const response = await fetch(
      `${config.runpod.apiUrl}/api/generate-with-system`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.runpod.apiKey,
        },
        body: JSON.stringify({
          system_prompt_key: 'shift_scheduler',
          prompt,
          model: 'llama3.1:8b-instruct-q6_K',
          stream: false,
          validate: true,
          options: {
            temperature: 0.5,
            num_ctx: 16384,
            num_predict: 3000,
          },
        }),
        signal: AbortSignal.timeout(30000), // 30s timeout
      }
    );

    if (!response.ok) {
      throw new Error(`RunPod API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.validation?.ok) {
      throw new Error('Schedule validation failed');
    }

    return data.parsed;
  },
};

function buildSchedulePrompt(
  storeName: string,
  weekStart: string,
  employees: any[]
): string {
  // Build prompt from employee data
  const lines = [
    `STORE: ${storeName}`,
    `WEEK: ${weekStart} to ...`,
    `OPERATING HOURS: 08:00-22:00`,
    '',
  ];

  for (const emp of employees) {
    lines.push(`EMPLOYEE ${emp.id}: ${emp.full_name}`);
    lines.push(`Manager Notes: ${emp.notes || 'None'}`);
    lines.push(`Availability:`);

    for (const slot of emp.shift_preferences.slots) {
      lines.push(`  ${slot.day} ${slot.time}: ${slot.status}`);
    }

    lines.push('');
  }

  lines.push('Generate optimal weekly schedule as JSON.');
  return lines.join('\n');
}
```

---

## Queue Behavior

**Configuration:**
- **Concurrency:** 1 (env: `GEN_MAX_CONCURRENCY=1`)
- **Queue Limit:** 32 (env: `GEN_MAX_QUEUE=32`)

**Queue Full Response:**
- **Status:** 429 Too Many Requests
- **Body:** `{"error":"queue_full","retry_after":5}`

**Monitoring:**
- `GET /api/queue-stats` (no authentication required)

---

## Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| **401** | Unauthorized | Missing or invalid `x-api-key` header |
| **404** | Not Found | Invalid endpoint path |
| **422** | Validation Error | Missing/invalid request body fields |
| **429** | Too Many Requests | Queue is full, retry after X seconds |
| **5xx** | Server Error | Upstream/model error |

---

## Performance & Timeout Recommendations

**For Small Requests (5 employees, 1 day):**
- `num_predict`: 500-1000
- `num_ctx`: 4096-8192
- Expected time: 5-8 seconds

**For Large Requests (15 employees, 7 days via batch):**
- `num_predict`: 2500-3000
- `num_ctx`: 16384
- Expected time: 12-18 seconds per day (retry included)

**Streaming:**
- Use `/ollama/generate` with `stream: true` for NDJSON streaming
- Not recommended for schedule generation (validation harder)

---

## Security Notes

⚠️ **Important Security Information:**

1. **API Key Scope:** This key is valid for the **hackathon period only**
2. **Do NOT commit:** Never commit this key to git or share publicly
3. **Rotate After Event:** Generate new key and restart proxy after hackathon
4. **Port Security:** Ollama (11434) is bound to localhost only; all traffic goes through proxy (8888)
5. **IP Restrictions:** Currently **open to all IPs** (can add allowlist in application layer if needed)

---

## FAQ

**Q: Is HTTPS/TLS configured?**
A: Yes, RunPod proxy provides TLS termination. We only serve HTTP on port 8888 internally.

**Q: What models are available?**
A: Run `GET /ollama/tags` (with auth) to list all models on the instance.

**Q: Can I use a different model?**
A: Yes, specify `model` parameter in request. Current models: `llama3.1:8b-instruct-q6_K`

**Q: Response time too slow?**
A: Try reducing `num_predict` or `num_ctx`, or use batch endpoint with fewer days.

**Q: How do I debug failed requests?**
A: Check response body for `error` field, and include full request/response when reporting issues.

---

**Ready to integrate!** If you encounter issues, share the request body and response for debugging.

**Next Steps:**
1. Test health endpoint: `curl https://ymgoqyxl58jzfo-8888.proxy.runpod.net/health`
2. Test authentication: `curl -H "x-api-key: ..." https://ymgoqyxl58jzfo-8888.proxy.runpod.net/ollama/tags`
3. Integrate into backend service (see TypeScript example above)
