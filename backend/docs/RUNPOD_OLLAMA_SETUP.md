# RunPod + Ollama Setup for Shiffy AI Shift Scheduling

**Project:** Shiffy - AI-Powered Shift Management System
**Use Case:** Shift schedule generation using local LLM (Ollama)
**Strategy:** Performance-optimized (7B-8B models), System prompt integration, Secure FastAPI proxy
**Last Updated:** October 24, 2025

---

## 🚀 Production Status

✅ **RunPod Instance:** ACTIVE (as of Oct 24, 2025)
✅ **Model:** `llama3.1:8b-instruct-q6_K` (deployed)
✅ **Hardware:** RTX A4000 (16 GB VRAM)
✅ **Endpoint:** `https://ejwkzjotxfg3i7-8888.proxy.runpod.net`

**Quick Start:** See [RUNPOD_PRODUCTION.md](./RUNPOD_PRODUCTION.md) for production endpoint details and integration examples.

**This document:** Detailed setup guide for reproducing the deployment or troubleshooting.

---

## 📋 Table of Contents

1. [Project-Specific Overview](#project-specific-overview)
2. [Hardware & Model Selection](#hardware--model-selection)
3. [Quick Start (TL;DR)](#quick-start-tldr)
4. [Detailed Setup](#detailed-setup)
5. [System Prompt Integration](#system-prompt-integration)
6. [Performance Optimization](#performance-optimization)
7. [Testing & Benchmarking](#testing--benchmarking)
8. [Cost Analysis](#cost-analysis)
9. [Production Checklist](#production-checklist)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project-Specific Overview

### Shiffy's AI Requirements

**Task:** Generate weekly shift schedules based on:
- Employee availability preferences (available/unavailable/off_request)
- Manager notes (e.g., "good with morning shifts")
- Constraints (minimum rest, fair distribution, coverage)

**Input:** JSON with employee data (~5-15 employees, 7 days, 30-min slots)
**Output:** JSON schedule with assigned shifts

**Performance Targets:**
- ⏱️ Response time: **<10 seconds** (user can't wait longer)
- ✅ JSON validity: **>95%** success rate
- 💰 Cost: **<$15 for 24h hackathon**

### Why Ollama (vs Llama on RunPod TGI)?

**Advantages:**
- ✅ **Full control** over model and parameters
- ✅ **System prompt integration** (easier than TGI)
- ✅ **Cost-effective** (pay only for compute, not API calls)
- ✅ **Privacy** (data doesn't leave our infrastructure)
- ✅ **Smaller models** perform well for structured tasks

**Disadvantages:**
- ❌ Setup complexity (vs hosted API)
- ❌ Need to manage infrastructure
- ⚠️ For MVP: Acceptable tradeoff (learning + control)

---

## 🖥️ Hardware & Model Selection

### Performance-First Model Comparison

| Model | VRAM | Speed | JSON Quality | Shift Scheduling Fit | Cost/Hour |
|-------|------|-------|--------------|---------------------|-----------|
| **llama3.2:3b-q6_K** | ~2 GB | ★★★★★ | ★★★ | Test/Dev only | $0.20 |
| **qwen2.5:7b-q6_K** | ~4.5 GB | ★★★★ | ★★★★★ | ✅ **BEST** | $0.40 |
| **llama3:8b-q6_K** | ~5 GB | ★★★★ | ★★★★ | ✅ **RECOMMENDED** | $0.40 |
| **mistral:7b-q6_K** | ~4 GB | ★★★★★ | ★★★★ | Alternative | $0.40 |
| **llama3.2:70b-q6_K** | ~40 GB | ★★ | ★★★★★ | Overkill | $0.80+ |

### Recommended Configuration

**✅ PRODUCTION CHOICE (Deployed):** `llama3.1:8b-instruct-q6_K`
- **Why?** Excellent JSON generation + reliable instruction following
- **Response Time:** 5-10 seconds (single day), 12-18s (full week via batch)
- **Sufficient for:** Shift scheduling with complex constraints
- **Hardware:** RTX A4000 (16 GB VRAM) - **confirmed fit**
- **Status:** Currently deployed and tested with 15-employee scenarios

**Alternative:** `qwen2.5:7b-instruct-q6_K`
- Potentially better JSON quality
- Slightly faster
- Consider for future optimization

**Fallback:** `llama3:8b-instruct-q6_K`
- Slightly older version than 3.1
- Still very reliable

**NOT Recommended:**
- ❌ `llama3.2:70b` - Too slow, unnecessary for structured tasks
- ❌ `llama3.2:3b` - Too weak for complex constraints

### GPU Requirements

```
RTX A4000 (16 GB VRAM):
├─ qwen2.5:7b-q6_K: ✅ Fits comfortably (~5 GB)
├─ llama3:8b-q6_K: ✅ Fits (~6 GB)
└─ llama3.2:70b: ❌ VRAM insufficient

RTX A6000 (48 GB VRAM):
└─ Unnecessary expense for this project
```

**Recommendation:** Use **RTX A4000** (cost-effective)

---

## 🚀 Quick Start (TL;DR)

> Complete setup in ~15 minutes. Assumes RunPod pod with Ubuntu base image.

```bash
# =============================================================================
# STEP 1: Install Ollama 0.1.32 (pinned version for stability)
# =============================================================================
curl -fL https://github.com/ollama/ollama/releases/download/v0.1.32/ollama-linux-amd64 \
  -o /usr/local/bin/ollama && chmod +x /usr/local/bin/ollama

ollama --version  # Verify: ollama version 0.1.32

# =============================================================================
# STEP 2: Install Python dependencies for FastAPI proxy
# =============================================================================
apt update && apt install -y python3-pip
pip install --upgrade pip
pip install fastapi "uvicorn[standard]" httpx

# =============================================================================
# STEP 3: Create secure FastAPI proxy with system prompt support
# =============================================================================
cat > /root/secure_proxy.py <<'PYTHON'
import os, httpx, json
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse, Response

# API Key protection
API_KEY = os.environ.get("SECURE_API_KEY", "CHANGE_ME_IMMEDIATELY")
OLLAMA_URL = "http://127.0.0.1:11434"

app = FastAPI()

# System prompts for different use cases
SYSTEM_PROMPTS = {
    "shift_scheduler": """You are an AI shift scheduler for retail/service businesses.

ROLE: Create fair and optimal weekly work schedules based on employee availability.

CRITICAL RULES:
1. Output ONLY valid JSON (no explanations, no markdown, no extra text)
2. NEVER assign shifts during employee "unavailable" times
3. Prioritize "available" slots over "off_request" slots
4. Balance total hours fairly across employees (within ±3 hours)
5. Ensure minimum 8-hour rest between consecutive shifts for same employee
6. Each time slot needs minimum coverage (at least 1-2 employees)
7. Respect manager notes as preferences (not hard constraints)

OUTPUT FORMAT (strict JSON):
{
  "shifts": [
    {
      "employee_id": "uuid-string",
      "employee_name": "Full Name",
      "day": "monday",
      "start_time": "09:00",
      "end_time": "17:00"
    }
  ],
  "summary": {
    "total_employees": 5,
    "total_shifts": 35,
    "hours_per_employee": {
      "uuid1": 24,
      "uuid2": 26
    },
    "warnings": []
  }
}

IMPORTANT: Start your response with the opening brace { and end with closing brace }. No preamble or explanation."""
}

def check_key(request: Request):
    """Verify API key in request headers"""
    if request.headers.get("x-api-key") != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid API key")

@app.get("/health")
def health():
    """Health check endpoint (no auth required)"""
    return {"status": "ok", "service": "shiffy-ollama-proxy"}

@app.post("/api/generate-with-system")
async def generate_with_system(request: Request):
    """
    Generate response with system prompt injection

    Request body:
    {
      "system_prompt_key": "shift_scheduler",  // Optional, default: shift_scheduler
      "prompt": "User prompt here...",
      "model": "qwen2.5:7b-instruct-q6_K",    // Optional
      "stream": false,                         // Optional
      "options": {}                            // Optional Ollama parameters
    }
    """
    check_key(request)
    body = await request.json()

    # Get system prompt
    system_prompt_key = body.get("system_prompt_key", "shift_scheduler")
    system_prompt = SYSTEM_PROMPTS.get(system_prompt_key, SYSTEM_PROMPTS["shift_scheduler"])
    user_prompt = body.get("prompt", "")

    # Combine system + user prompt
    full_prompt = f"{system_prompt}\n\n{user_prompt}"

    # Prepare Ollama request
    ollama_body = {
        "model": body.get("model", "qwen2.5:7b-instruct-q6_K"),
        "prompt": full_prompt,
        "stream": body.get("stream", False),
        "options": body.get("options", {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 2000,
            "repeat_penalty": 1.1
        })
    }

    # Forward to Ollama
    async with httpx.AsyncClient(timeout=120.0) as client:
        url = f"{OLLAMA_URL}/api/generate"
        if ollama_body["stream"]:
            # Streaming response
            async with client.stream("POST", url, json=ollama_body) as upstream:
                async def gen():
                    async for chunk in upstream.aiter_bytes():
                        yield chunk
                return StreamingResponse(gen(), media_type="application/x-ndjson")
        else:
            # Non-streaming response
            response = await client.post(url, json=ollama_body)
            return Response(content=response.content, status_code=response.status_code,
                          media_type="application/json")

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_passthrough(request: Request, path: str):
    """
    Passthrough proxy for standard Ollama endpoints
    (e.g., /api/tags, /api/pull, /api/show)
    """
    check_key(request)
    async with httpx.AsyncClient(timeout=None) as client:
        url = f"{OLLAMA_URL}/api/{path}"
        method = request.method.lower()
        body = await request.body()

        async with client.stream(method, url, content=body,
                                headers={"Content-Type": "application/json"}) as upstream:
            content_type = upstream.headers.get("content-type", "").split(";")[0].strip().lower()
            status = upstream.status_code

            if content_type in ("application/x-ndjson", "text/event-stream"):
                # Streaming response
                async def gen():
                    async for chunk in upstream.aiter_bytes():
                        yield chunk
                return StreamingResponse(gen(), media_type=content_type, status_code=status)

            # Non-streaming response
            content_bytes = await upstream.aread()

    try:
        data = json.loads(content_bytes.decode("utf-8"))
        return JSONResponse(status_code=status, content=data)
    except Exception:
        return Response(content=content_bytes, status_code=status,
                       media_type=content_type or "application/octet-stream")
PYTHON

# =============================================================================
# STEP 4: Generate secure API key
# =============================================================================
API_KEY=$(openssl rand -base64 32)
echo "Generated API Key: $API_KEY"
echo "SECURE_API_KEY=$API_KEY" > /etc/secure_proxy.env

# =============================================================================
# STEP 5: Create startup script
# =============================================================================
cat > /start.sh <<'BASH'
#!/bin/bash
set -euo pipefail

# Load API key from env file
if [ -f /etc/secure_proxy.env ]; then
  set -a
  source /etc/secure_proxy.env
  set +a
fi

# Ensure Ollama binds to localhost only (security)
export OLLAMA_HOST=127.0.0.1:11434

# Start Ollama in background
echo "[$(date)] Starting Ollama service..."
/usr/local/bin/ollama serve > /var/log/ollama.log 2>&1 &

# Wait for Ollama to be ready
sleep 5

# Start FastAPI proxy (foreground - keeps container alive)
echo "[$(date)] Starting FastAPI proxy on port 8888..."
exec /usr/local/bin/uvicorn --app-dir /root secure_proxy:app \
  --host 0.0.0.0 --port 8888 --log-level info
BASH

chmod +x /start.sh

# =============================================================================
# STEP 6: Pull recommended model
# =============================================================================
export OLLAMA_HOST=127.0.0.1:11434
/usr/local/bin/ollama serve > /var/log/ollama.log 2>&1 &
sleep 5

echo "Pulling qwen2.5:7b-instruct-q6_K model (this may take 5-10 minutes)..."
/usr/local/bin/ollama pull qwen2.5:7b-instruct-q6_K

# Alternative: llama3:8b-instruct-q6_K
# /usr/local/bin/ollama pull llama3:8b-instruct-q6_K

# =============================================================================
# STEP 7: Stop JupyterLab (we're using port 8888 for proxy)
# =============================================================================
pkill -f jupyter || true

# =============================================================================
# STEP 8: Start services
# =============================================================================
nohup /start.sh > /var/log/start.log 2>&1 &

echo "✅ Setup complete!"
echo "📝 API Key saved to: /etc/secure_proxy.env"
echo "🌐 Proxy URL: https://<your-pod-id>-8888.proxy.runpod.net"
echo "🧪 Test health: curl https://<pod>-8888.proxy.runpod.net/health"
```

**Important:** Save your API key from `/etc/secure_proxy.env` - you'll need it in backend `.env.local`

---

## 🔧 Detailed Setup

### 1. Ollama Installation

**Why version 0.1.32?**
- Stable release (no CUDA bugs)
- Tested with RTX A4000
- Direct binary (no tar issues)

```bash
curl -fL https://github.com/ollama/ollama/releases/download/v0.1.32/ollama-linux-amd64 \
  -o /usr/local/bin/ollama
chmod +x /usr/local/bin/ollama
ollama --version
```

### 2. Model Download

**Primary:** Qwen 2.5 7B (best for JSON)
```bash
export OLLAMA_HOST=127.0.0.1:11434
ollama pull qwen2.5:7b-instruct-q6_K
```

**Verification:**
```bash
ollama list
# Should show: qwen2.5:7b-instruct-q6_K with size ~4.5 GB
```

### 3. FastAPI Proxy Configuration

**Key Features:**
- ✅ API key authentication (`x-api-key` header)
- ✅ System prompt injection (`/api/generate-with-system`)
- ✅ Streaming support (for real-time UX in future)
- ✅ Passthrough for standard endpoints (`/api/tags`, `/api/pull`)

**Security:**
- Ollama bound to `127.0.0.1:11434` (not exposed)
- Only proxy (port 8888) is public
- All requests require API key

### 4. Port Configuration (RunPod)

**Default:** Port 8888 is usually pre-exposed as HTTP Service
- If JupyterLab is running on 8888 → Kill it: `pkill -f jupyter`
- Proxy will take over 8888
- URL format: `https://<pod-id>-8888.proxy.runpod.net`

---

## 🎨 System Prompt Integration

### How It Works

**Traditional Ollama API:**
```bash
# Single prompt (no system/user separation)
curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"qwen2.5:7b","prompt":"Your full prompt here..."}'
```

**Shiffy's Enhanced API:**
```bash
# System prompt automatically prepended
curl -X POST https://<pod>-8888.proxy.runpod.net/api/generate-with-system \
  -H "x-api-key: YOUR_KEY" \
  -d '{
    "system_prompt_key": "shift_scheduler",
    "prompt": "STORE: Demo Cafe\nWEEK: 2025-10-28...",
    "model": "qwen2.5:7b-instruct-q6_K"
  }'
```

**Result:** Proxy concatenates:
```
[SYSTEM PROMPT: Rules + Format]
[USER PROMPT: Your data]
→ Sent to Ollama as single prompt
```

### Backend Integration

```typescript
// src/services/llama.service.ts

const RUNPOD_URL = process.env.RUNPOD_API_URL; // https://<pod>-8888.proxy.runpod.net
const API_KEY = process.env.RUNPOD_API_KEY;

export const llamaService = {
  buildUserPrompt(scheduleData) {
    const { employees, storeName, weekStart, weekEnd } = scheduleData;

    return `
STORE: ${storeName}
WEEK: ${weekStart} to ${weekEnd}
OPERATING HOURS: 08:00 - 23:00 daily

EMPLOYEES AND AVAILABILITY:

${employees.map(emp => `
--- Employee: ${emp.name} (ID: ${emp.id}) ---
Manager Notes: ${emp.managerNotes || 'None'}
Availability for this week:
${emp.preferences.map(slot =>
  `  ${slot.day} ${slot.time}: ${slot.status}`
).join('\n')}
`).join('\n')}

REQUIREMENTS:
- Minimum 2 employees per time slot
- Each employee should work 20-35 hours this week
- Fair distribution of weekend shifts
- Respect all "unavailable" time slots

Generate optimized schedule as JSON.`;
  },

  async generateSchedule(scheduleData) {
    const userPrompt = this.buildUserPrompt(scheduleData);

    const response = await fetch(`${RUNPOD_URL}/api/generate-with-system`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        system_prompt_key: 'shift_scheduler',
        prompt: userPrompt,
        model: 'qwen2.5:7b-instruct-q6_K',
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 2000
        }
      }),
      signal: AbortSignal.timeout(30000) // 30s timeout
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse Ollama response
    const rawResponse = data.response; // Ollama returns { response: "..." }

    // Clean potential markdown
    const cleaned = rawResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse JSON
    const schedule = JSON.parse(cleaned);

    // Validate structure
    if (!schedule.shifts || !Array.isArray(schedule.shifts)) {
      throw new Error('Invalid schedule format from Ollama');
    }

    return schedule;
  },

  // Fallback for demo/testing
  getMockSchedule(scheduleData) {
    return {
      shifts: [
        {
          employee_id: scheduleData.employees[0]?.id || "mock-uuid",
          employee_name: scheduleData.employees[0]?.name || "Mock Employee",
          day: "monday",
          start_time: "09:00",
          end_time: "17:00"
        }
      ],
      summary: {
        total_employees: scheduleData.employees.length,
        total_shifts: 1,
        hours_per_employee: {}
      }
    };
  }
};
```

---

## ⚡ Performance Optimization

### 1. Quantization Choice

**Recommended:** `q6_K` (6-bit K-quant)
- Balanced quality and speed
- 5-10 second response time for shift scheduling
- Minimal quality loss vs full precision

**Alternatives:**
```
q8_0  → Higher quality, +20% slower, +30% VRAM
q4_K_M → 2x faster, noticeable quality drop for complex tasks
fp16  → Full quality, 3x VRAM, overkill for this task
```

### 2. Generation Parameters

**Optimal for JSON output:**
```json
{
  "temperature": 0.7,       // Balanced creativity/determinism
  "top_p": 0.9,             // Nucleus sampling
  "num_predict": 2000,      // Max tokens (schedule JSON ~500-1000 tokens)
  "repeat_penalty": 1.1,    // Avoid repetitive output
  "stop": ["\n\n\n"]        // Stop on triple newline (safety)
}
```

**Tuning tips:**
- **Lower temperature (0.5-0.6)** → More deterministic JSON
- **Higher num_predict (3000)** → For larger schedules (15+ employees)

### 3. Timeout Strategy

**Backend-side timeout handling:**
```typescript
async generateScheduleWithFallback(scheduleData) {
  try {
    return await this.generateSchedule(scheduleData);
  } catch (error) {
    console.error('Ollama generation failed:', error);

    // Fallback strategies
    if (error.name === 'AbortError') {
      // Timeout - use mock data for demo
      console.warn('Using mock schedule due to timeout');
      return this.getMockSchedule(scheduleData);
    }

    throw error; // Re-throw for other errors
  }
}
```

---

## 🧪 Testing & Benchmarking

### Health Check

```bash
BASE="https://<your-pod-id>-8888.proxy.runpod.net"

# 1. Health endpoint (no auth)
curl -s "$BASE/health"
# Expected: {"status":"ok","service":"shiffy-ollama-proxy"}
```

### API Key Test

```bash
API_KEY="<your-key-from-/etc/secure_proxy.env>"

# 2. List models (requires auth)
curl -s -H "x-api-key: $API_KEY" "$BASE/api/tags"
# Expected: {"models":[{"name":"qwen2.5:7b-instruct-q6_K",...}]}
```

### Simple Generation Test

```bash
# 3. Test system prompt endpoint
curl -X POST "$BASE/api/generate-with-system" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt_key": "shift_scheduler",
    "prompt": "STORE: Test Store\nWEEK: 2025-10-28 to 2025-11-03\n\nEMPLOYEE 1: Alice (ID: test-uuid-1)\nManager Notes: Good with mornings\nAvailability:\n  monday 09:00-12:00: available\n  monday 12:00-17:00: unavailable\n\nEMPLOYEE 2: Bob (ID: test-uuid-2)\nManager Notes: Prefers evenings\nAvailability:\n  monday 09:00-12:00: unavailable\n  monday 12:00-17:00: available\n\nGenerate schedule as JSON.",
    "model": "qwen2.5:7b-instruct-q6_K",
    "stream": false
  }'
```

**Expected response structure:**
```json
{
  "model": "qwen2.5:7b-instruct-q6_K",
  "created_at": "2025-10-24T...",
  "response": "{\"shifts\":[{\"employee_id\":\"test-uuid-1\",\"employee_name\":\"Alice\",\"day\":\"monday\",\"start_time\":\"09:00\",\"end_time\":\"12:00\"},...],\"summary\":{...}}",
  "done": true,
  "total_duration": 5234567890
}
```

### Benchmark (Response Time)

```bash
# Measure end-to-end response time
time curl -X POST "$BASE/api/generate-with-system" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d @test_prompt.json \
  -o /dev/null -s

# Target: real 0m5-10s (for 5 employees, 7 days)
```

### Performance Targets

| Scenario | Model | Response Time | Success Rate |
|----------|-------|---------------|--------------|
| 5 employees, 7 days | qwen2.5:7b-q6_K | 5-8s | >95% |
| 10 employees, 7 days | qwen2.5:7b-q6_K | 8-12s | >90% |
| 15 employees, 7 days | qwen2.5:7b-q6_K | 12-18s | >85% |

**If exceeding targets:**
- Consider `q4_K_M` quantization (2x faster)
- Or add more powerful GPU (A6000)

---

## 💰 Cost Analysis

### RunPod GPU Pricing (Approximate)

```
RTX A4000 (16 GB VRAM) - RECOMMENDED
├─ On-Demand: ~$0.40/hour
├─ Spot Instance: ~$0.20/hour (risk of interruption)
└─ 24h Hackathon Cost: $10-15

RTX A6000 (48 GB VRAM) - OVERKILL
├─ On-Demand: ~$0.80/hour
└─ 24h Cost: ~$20

RTX 4090 (24 GB VRAM) - ALTERNATIVE
├─ On-Demand: ~$0.50/hour
└─ Good middle ground if A4000 unavailable
```

### Model Size vs Cost

```
qwen2.5:7b-q6_K:
├─ VRAM: ~4.5 GB
├─ Fits on: A4000, 4090, A6000
└─ Recommendation: ✅ A4000 (most cost-effective)

llama3:8b-q6_K:
├─ VRAM: ~5 GB
├─ Fits on: A4000, 4090, A6000
└─ Recommendation: ✅ A4000

llama3.2:70b-q6_K:
├─ VRAM: ~40 GB
├─ Requires: A6000 (48 GB)
└─ Cost: 2x A4000, unnecessary for this task ❌
```

### Cost Optimization Tips

1. **Use Spot Instances** (if not demo day)
   - 50% cheaper
   - Risk: Can be interrupted (save model in persistent volume)

2. **Stop when not in use**
   ```bash
   # Stop pod (RunPod dashboard)
   # Restart before testing
   ```

3. **Use smaller model for dev/test**
   ```bash
   ollama pull llama3.2:3b-instruct-q6_K  # Fast, cheap for testing
   ```

---

## ✅ Production Checklist

**Before Deployment:**

- [ ] **Model Downloaded**
  ```bash
  ollama list | grep qwen2.5:7b-instruct-q6_K
  ```

- [ ] **Proxy Running**
  ```bash
  curl -s http://127.0.0.1:8888/health
  # Expected: {"status":"ok"}
  ```

- [ ] **API Key Configured**
  ```bash
  cat /etc/secure_proxy.env
  # Should contain: SECURE_API_KEY=...
  ```

- [ ] **External Access Works**
  ```bash
  curl -s https://<pod>-8888.proxy.runpod.net/health
  ```

- [ ] **Backend .env Updated**
  ```env
  # backend/.env.local
  RUNPOD_API_URL=https://<pod-id>-8888.proxy.runpod.net
  RUNPOD_API_KEY=<key-from-/etc/secure_proxy.env>
  ```

- [ ] **Test Full Flow**
  ```bash
  # From backend directory
  node -e "
    const fetch = require('node-fetch');
    fetch('${RUNPOD_API_URL}/api/generate-with-system', {
      method: 'POST',
      headers: {
        'x-api-key': '${RUNPOD_API_KEY}',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_prompt_key: 'shift_scheduler',
        prompt: 'Quick test',
        model: 'qwen2.5:7b-instruct-q6_K',
        stream: false
      })
    })
    .then(r => r.json())
    .then(console.log);
  "
  ```

- [ ] **Response Time <10s**
  ```bash
  time curl -X POST ...
  ```

- [ ] **JSON Parsing Works**
  ```bash
  # Test in backend service
  npm run dev
  # Test /shifts/generate-schedule endpoint
  ```

**Monitoring:**

```bash
# Check logs
tail -f /var/log/secure_proxy.log
tail -f /var/log/ollama.log

# Check VRAM usage
nvidia-smi

# Check process status
ps aux | grep ollama
ps aux | grep uvicorn
```

---

## 🔧 Troubleshooting

### Issue: "Connection refused" to RunPod URL

**Symptoms:**
```
curl: (7) Failed to connect to <pod>-8888.proxy.runpod.net
```

**Solutions:**
1. Check proxy is running:
   ```bash
   ps aux | grep uvicorn
   ```
2. Restart proxy:
   ```bash
   pkill -f uvicorn
   nohup /start.sh > /var/log/start.log 2>&1 &
   ```
3. Verify port 8888 is exposed (RunPod dashboard → HTTP Services)

---

### Issue: "401 Unauthorized"

**Symptoms:**
```json
{"detail":"Unauthorized: Invalid API key"}
```

**Solutions:**
1. Check API key in request:
   ```bash
   echo $RUNPOD_API_KEY  # Should match /etc/secure_proxy.env
   ```
2. Verify header name: `x-api-key` (not `X-API-Key` or `Authorization`)

---

### Issue: Response time >20 seconds

**Symptoms:**
- Slow generation
- Timeouts in backend

**Solutions:**
1. **Switch to faster model:**
   ```bash
   ollama pull qwen2.5:7b-instruct-q4_K_M  # 2x faster
   ```
2. **Lower num_predict:**
   ```json
   {"options": {"num_predict": 1000}}
   ```
3. **Check GPU utilization:**
   ```bash
   nvidia-smi
   # If GPU usage <50%, model might be CPU-bound
   ```

---

### Issue: Invalid JSON response

**Symptoms:**
```
JSONDecodeError: Expecting value: line 1 column 1
```

**Solutions:**
1. **Check raw response:**
   ```bash
   curl ... | jq -r '.response'
   ```
2. **Improve system prompt:**
   - Add: "Start your response with { and end with }. No preamble."
3. **Lower temperature:**
   ```json
   {"options": {"temperature": 0.5}}
   ```
4. **Use fallback:**
   ```typescript
   try {
     return JSON.parse(response);
   } catch {
     console.error('Invalid JSON, using mock');
     return this.getMockSchedule(data);
   }
   ```

---

### Issue: Model not found

**Symptoms:**
```json
{"error":"model 'qwen2.5:7b-instruct-q6_K' not found"}
```

**Solutions:**
1. **List available models:**
   ```bash
   ollama list
   ```
2. **Pull model:**
   ```bash
   ollama pull qwen2.5:7b-instruct-q6_K
   ```
3. **Check spelling** (exact name required)

---

### Issue: VRAM out of memory

**Symptoms:**
```
CUDA out of memory
```

**Solutions:**
1. **Use smaller quantization:**
   ```bash
   ollama pull qwen2.5:7b-instruct-q4_K_M  # ~3 GB vs 4.5 GB
   ```
2. **Upgrade GPU:**
   - A4000 (16 GB) → A6000 (48 GB)
3. **Close other processes:**
   ```bash
   pkill -f jupyter
   ```

---

## 📚 Additional Resources

**Ollama Documentation:**
- API Reference: https://github.com/ollama/ollama/blob/main/docs/api.md
- Model Library: https://ollama.com/library

**RunPod Documentation:**
- Pod Management: https://docs.runpod.io/pods/overview
- HTTP Services: https://docs.runpod.io/pods/configuration/expose-ports

**Model Benchmarks:**
- Qwen 2.5: https://qwenlm.github.io/blog/qwen2.5/
- Llama 3: https://ai.meta.com/blog/meta-llama-3/

---

## 🎯 Quick Reference

**Essential Commands:**
```bash
# Start services
/start.sh

# Check health
curl http://127.0.0.1:8888/health

# View logs
tail -f /var/log/secure_proxy.log
tail -f /var/log/ollama.log

# Check GPU
nvidia-smi

# Pull model
ollama pull qwen2.5:7b-instruct-q6_K

# Test API
curl -X POST https://<pod>-8888.proxy.runpod.net/api/generate-with-system \
  -H "x-api-key: $API_KEY" -H "Content-Type: application/json" \
  -d '{"system_prompt_key":"shift_scheduler","prompt":"Test","model":"qwen2.5:7b-instruct-q6_K","stream":false}'
```

**Backend Integration:**
```env
# .env.local
RUNPOD_API_URL=https://<pod-id>-8888.proxy.runpod.net
RUNPOD_API_KEY=<key-from-/etc/secure_proxy.env>
```

---

**Last Updated:** October 24, 2025
**Version:** 1.0.0
**Maintainer:** Shiffy Backend Team
