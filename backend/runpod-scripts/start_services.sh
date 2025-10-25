#!/bin/bash
# Auto-start script for Ollama and Proxy services
# Created: 2025-10-25
# Deploy to: /root/start_services.sh on RunPod

LOG_FILE="/root/startup.log"
echo "=== Service Startup: $(date) ===" >> "$LOG_FILE"

# Function to check if a process is running
is_running() {
    ps aux | grep -v grep | grep "$1" > /dev/null 2>&1
    return $?
}

# 1. Start Ollama
echo "[$(date)] Starting Ollama..." >> "$LOG_FILE"
if is_running "ollama serve"; then
    echo "[$(date)] Ollama already running" >> "$LOG_FILE"
else
    nohup ollama serve > /root/ollama.log 2>&1 &
    echo "[$(date)] Ollama started (PID: $!)" >> "$LOG_FILE"

    # Wait for Ollama to be ready (max 30 seconds)
    for i in {1..30}; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo "[$(date)] Ollama is ready" >> "$LOG_FILE"
            break
        fi
        sleep 1
    done
fi

# 2. Start Proxy
echo "[$(date)] Starting Proxy..." >> "$LOG_FILE"
if is_running "uvicorn secure_proxy:app"; then
    echo "[$(date)] Proxy already running" >> "$LOG_FILE"
else
    cd /root
    nohup uvicorn secure_proxy:app --host 0.0.0.0 --port 8888 --log-level info > /root/proxy.log 2>&1 &
    echo "[$(date)] Proxy started (PID: $!)" >> "$LOG_FILE"

    # Wait for proxy to be ready (max 10 seconds)
    for i in {1..10}; do
        if curl -s http://localhost:8888/health > /dev/null 2>&1; then
            echo "[$(date)] Proxy is ready" >> "$LOG_FILE"
            break
        fi
        sleep 1
    done
fi

# 3. Verify services
echo "[$(date)] Verifying services..." >> "$LOG_FILE"
if curl -s http://localhost:8888/health > /dev/null 2>&1; then
    echo "[$(date)] ✅ All services running successfully" >> "$LOG_FILE"
else
    echo "[$(date)] ❌ Service verification failed" >> "$LOG_FILE"
fi

echo "=== Startup Complete: $(date) ===" >> "$LOG_FILE"
