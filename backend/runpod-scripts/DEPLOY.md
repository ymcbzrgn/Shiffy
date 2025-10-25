# RunPod Auto-Restart Deployment Guide

## 📋 Overview

This directory contains scripts to ensure RunPod services (Ollama + Proxy) automatically restart after pod reboots or crashes.

## 📦 Files

- **start_services.sh** - Initial startup script (runs on boot)
- **watchdog.sh** - Monitors and restarts services every minute
- **DEPLOY.md** - This deployment guide

## 🚀 Deployment Steps

### Step 1: Copy Scripts to RunPod

Run these commands **in your RunPod terminal**:

```bash
# Create start_services.sh
cat > /root/start_services.sh << 'EOF'
[PASTE CONTENTS OF start_services.sh HERE]
EOF

# Create watchdog.sh
cat > /root/watchdog.sh << 'EOF'
[PASTE CONTENTS OF watchdog.sh HERE]
EOF

# Make scripts executable
chmod +x /root/start_services.sh
chmod +x /root/watchdog.sh
```

**OR** use this quick one-liner for each file:

```bash
# For start_services.sh
echo '#!/bin/bash
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

echo "=== Startup Complete: $(date) ===" >> "$LOG_FILE"' > /root/start_services.sh

chmod +x /root/start_services.sh

# For watchdog.sh
echo '#!/bin/bash
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
fi' > /root/watchdog.sh

chmod +x /root/watchdog.sh
```

### Step 2: Set Up Cron Jobs

```bash
# Open crontab editor
crontab -e

# Add these lines (press 'i' to insert if using vi):
@reboot /root/start_services.sh >> /root/startup.log 2>&1
*/1 * * * * /root/watchdog.sh >> /root/watchdog.log 2>&1

# Save and exit:
# - If using vi: Press ESC, then type :wq and press ENTER
# - If using nano: Press CTRL+X, then Y, then ENTER
```

**Explanation:**
- `@reboot` - Runs start_services.sh automatically when pod restarts
- `*/1 * * * *` - Runs watchdog.sh every 1 minute to check service health

### Step 3: Verify Cron Setup

```bash
# List current cron jobs
crontab -l

# You should see:
# @reboot /root/start_services.sh >> /root/startup.log 2>&1
# */1 * * * * /root/watchdog.sh >> /root/watchdog.log 2>&1
```

### Step 4: Test Auto-Restart

```bash
# Test 1: Manual startup script
/root/start_services.sh
cat /root/startup.log  # Check if services started

# Test 2: Stop Ollama and wait 1 minute (watchdog should restart it)
pkill -f "ollama serve"
sleep 65  # Wait for watchdog to run
ps aux | grep ollama  # Should show ollama running again
cat /root/watchdog.log  # Check watchdog activity

# Test 3: Stop Proxy and wait 1 minute
pkill -f "uvicorn secure_proxy"
sleep 65
ps aux | grep uvicorn  # Should show uvicorn running again

# Test 4: Full health check
curl http://localhost:8888/health
# Should return: {"status":"ok","service":"shiffy-ollama-proxy"}
```

## 📊 Monitoring

### View Service Logs

```bash
# Startup log
tail -f /root/startup.log

# Watchdog log
tail -f /root/watchdog.log

# Ollama log
tail -f /root/ollama.log

# Proxy log
tail -f /root/proxy.log
```

### Check Service Status

```bash
# Check if services are running
ps aux | grep -E "ollama|uvicorn"

# Quick health check
curl http://localhost:8888/health

# Queue stats
curl http://localhost:8888/api/queue-stats
```

## 🔧 Troubleshooting

### Services not starting after reboot

```bash
# Check if cron is running
ps aux | grep cron

# Check crontab is set
crontab -l

# Manually run startup script
/root/start_services.sh
cat /root/startup.log
```

### Watchdog not restarting services

```bash
# Check watchdog log
tail -20 /root/watchdog.log

# Manually run watchdog
/root/watchdog.sh

# Check cron is executing watchdog
grep watchdog /var/log/syslog  # or /var/log/cron
```

### Nginx still returning 502

```bash
# Check Nginx is running
ps aux | grep nginx

# Check Nginx config
nginx -t

# Reload Nginx
nginx -s reload

# Check port 8888 is listening
ss -tlnp | grep 8888
```

## ✅ Success Criteria

After deployment, you should have:
- ✅ Services auto-start on pod reboot
- ✅ Services auto-restart if they crash
- ✅ Watchdog runs every minute
- ✅ All logs are being written
- ✅ Health endpoint accessible: `curl http://localhost:8888/health`
- ✅ External endpoint accessible: `curl https://ymgoqyxl58jzfo-8888.proxy.runpod.net/health`

## 📝 Notes

- **Cron logs are minimal** - Watchdog only logs when it restarts services or detects issues
- **Startup log grows** - Each reboot adds to `/root/startup.log`
- **Log rotation** - Consider setting up logrotate if logs grow too large
- **RunPod persistence** - These scripts survive pod stops/starts but NOT pod termination

## 🆘 Emergency Commands

```bash
# Kill all services
pkill -f "ollama serve"
pkill -f "uvicorn secure_proxy"

# Remove cron jobs (if needed)
crontab -r

# Restart all services manually
/root/start_services.sh

# View all processes
ps aux | grep -E "ollama|uvicorn|watchdog"
```

---

**Last Updated:** 2025-10-25
**RunPod URL:** https://ymgoqyxl58jzfo-8888.proxy.runpod.net
