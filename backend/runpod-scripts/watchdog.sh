#!/bin/bash
# Watchdog script - Monitors and restarts Ollama/Proxy if they crash
# Created: 2025-10-25
# Deploy to: /root/watchdog.sh on RunPod
# Run via cron: */1 * * * * /root/watchdog.sh >> /root/watchdog.log 2>&1

LOG_FILE="/root/watchdog.log"

# Function to check if a process is running
is_running() {
    ps aux | grep -v grep | grep "$1" > /dev/null 2>&1
    return $?
}

# Function to restart a service
restart_service() {
    local service_name=$1
    local restart_command=$2

    echo "[$(date)] ⚠️  $service_name is down, restarting..." >> "$LOG_FILE"
    eval "$restart_command"
    echo "[$(date)] ✅ $service_name restarted" >> "$LOG_FILE"
}

# Check Ollama
if ! is_running "ollama serve"; then
    restart_service "Ollama" "nohup ollama serve > /root/ollama.log 2>&1 &"
    sleep 5  # Wait for Ollama to initialize
fi

# Check Proxy
if ! is_running "uvicorn secure_proxy:app"; then
    restart_service "Proxy" "cd /root && nohup uvicorn secure_proxy:app --host 0.0.0.0 --port 8888 --log-level info > /root/proxy.log 2>&1 &"
    sleep 3  # Wait for Proxy to initialize
fi

# Health check (only log if unhealthy)
if ! curl -s http://localhost:8888/health > /dev/null 2>&1; then
    echo "[$(date)] ❌ Health check failed - services may be unhealthy" >> "$LOG_FILE"
fi
