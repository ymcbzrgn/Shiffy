# ⚙️ Shiffy Backend - AI-Powered Shift Management API

**Node.js + Express + TypeScript REST API with Llama AI Integration**

<p align="center">
  <img src="https://img.shields.io/badge/Runtime-Node.js%2020-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Framework-Express-000000?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/AI-Llama%203.2%2070B-FF6F00?style=for-the-badge" alt="Llama" />
</p>

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Database Schema](#-database-schema)
- [Llama AI Integration](#-llama-ai-integration)
- [Cron Jobs](#-cron-jobs)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Dökümantasyon](#-dökümantasyon)

---

## 🎯 Proje Hakkında

Shiffy Backend, **Meta Llama 3.2 70B** AI modelini kullanarak optimal vardiya takvimleri oluşturan **RESTful API sunucusudur**. **B2B2C** modeline göre tasarlanmış, yöneticilerin çalışanlarını yönetmesini ve AI destekli otomatik takvim oluşturmasını sağlar.

### 🏆 Hackathon Details
- **Event:** Meta & YTU Llama Hackathon 2025
- **Dates:** 24-26 Ekim 2025
- **Team:** Golden Head
- **Development Time:** 18 saat (hackathon sprint)

### 🎨 Mimari Felsefe
- **Clean Architecture:** Routes → Services → Repositories katmanları
- **KISS Principle:** No ORM, direct Supabase client usage
- **Stateless API:** JWT-based authentication, horizontal scaling ready
- **Environment Parity:** Local ve production environment'lar aynı

---

## ✨ Özellikler

### 🔐 Dual Authentication System
- [x] **Manager Auth:** Supabase Auth (email/password)
- [x] **Employee Auth:** Custom JWT (username/password)
- [x] **Token Management:** 7-day expiry, bcrypt password hashing
- [x] **Middleware:** Unified auth middleware supporting both token types

### 👥 Employee Management
- [x] **CRUD Operations:** Create, read, update, delete employees
- [x] **Manager Notes:** Context-aware notes for AI scheduling
- [x] **Status Toggle:** Active/inactive employee management
- [x] **Validation:** Username uniqueness, password strength

### 📅 Shift Preferences
- [x] **30-Minute Slots:** Granular shift preferences
- [x] **Weekly System:** Week-based preference collection
- [x] **Color-Coded:** Available/Unavailable/Off Request
- [x] **Draft System:** Auto-save before submission

### 🤖 AI Schedule Generation
- [x] **Llama 3.2 70B:** RunPod-hosted AI model
- [x] **Context-Aware:** Employee preferences + manager notes
- [x] **Validation:** Business rules (8h rest, max hours/week)
- [x] **Manual Override:** Manager can edit AI-generated schedules
- [x] **Approval Workflow:** Draft → Review → Approve → Distribute

### ⏰ Automated Scheduling
- [x] **Cron Jobs:** node-cron based automated triggers
- [x] **Deadline System:** Auto-generate on configurable deadline day
- [x] **Batch Processing:** Process all managers at once
- [x] **Error Handling:** Graceful failures, detailed logging

### 💰 Sales Reporting
- [x] **Daily Reports:** Revenue and transaction tracking
- [x] **Weekly Summaries:** Aggregated sales data
- [x] **Manager Dashboard:** Real-time statistics

### ⚙️ Manager Settings
- [x] **Deadline Configuration:** Customizable weekly deadline
- [x] **Work Days:** Configure business operation days
- [x] **Shift Duration:** Customizable slot duration

---

## 🛠 Teknoloji Stack

```yaml
Runtime:            Node.js 20.x
Framework:          Express.js 4.18
Language:           TypeScript 5.3 (strict mode)
Database:           PostgreSQL via Supabase
Auth Provider:      Supabase Auth + Custom JWT
Password Hashing:   bcrypt 5.1.1
Token Generation:   jsonwebtoken 9.0.2
Scheduling:         node-cron 4.2.1
CORS:               cors 2.8.5
HTTP Client:        Native fetch (for RunPod)
Process Manager:    PM2 (production)
```

### 📦 Core Dependencies

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "express": "^4.18.2",
  "bcrypt": "5.1.1",
  "jsonwebtoken": "9.0.2",
  "node-cron": "^4.2.1",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### 🛠️ Dev Dependencies

```json
{
  "typescript": "^5.3.3",
  "@types/node": "^20.10.0",
  "@types/express": "^4.17.21",
  "@types/bcrypt": "^5.0.2",
  "@types/jsonwebtoken": "^9.0.5",
  "@types/cors": "^2.8.17",
  "ts-node": "^10.9.2",
  "nodemon": "^3.0.2"
}
```

---

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── server.ts                      # Express server entry point
│   │
│   ├── config/                        # Konfigürasyon
│   │   ├── env.config.ts             # Environment variables
│   │   ├── supabase.config.ts        # Supabase client
│   │   └── cors.config.ts            # CORS settings
│   │
│   ├── routes/                        # API Routes
│   │   ├── index.ts                  # Main router
│   │   ├── employee.routes.ts        # POST /api/employee/login
│   │   ├── manager.routes.ts         # /api/manager/employees/*
│   │   ├── shift.routes.ts           # /api/shifts/preferences
│   │   ├── schedule.routes.ts        # /api/schedules/generate
│   │   ├── sales-reports.routes.ts   # /api/sales-reports/*
│   │   ├── sales.routes.ts           # /api/sales/* (legacy)
│   │   ├── manager-settings.routes.ts # /api/manager/settings
│   │   └── auto-schedule.routes.ts   # /api/auto-schedule/trigger-all
│   │
│   ├── services/                      # Business Logic
│   │   ├── auto-schedule.service.ts  # Cron + AI generation
│   │   ├── llama.service.ts          # RunPod Llama API
│   │   ├── schedule.service.ts       # Schedule CRUD
│   │   ├── shift.service.ts          # Shift preferences
│   │   └── sales-generator.service.ts # Mock sales data
│   │
│   ├── repositories/                  # Data Access
│   │   └── shift.repository.ts       # Supabase queries
│   │
│   ├── middleware/                    # Express Middleware
│   │   ├── auth.middleware.ts        # JWT + Supabase auth
│   │   └── error.middleware.ts       # Global error handler
│   │
│   ├── utils/                         # Utilities
│   │   ├── jwt.utils.ts              # JWT generate/verify
│   │   └── password.utils.ts         # bcrypt helpers
│   │
│   └── types/                         # TypeScript Types
│       ├── express.d.ts              # Express extensions
│       ├── api.types.ts              # API request/response
│       ├── employee.types.ts         # Employee DTOs
│       ├── shift.types.ts            # Shift preferences
│       ├── schedule.types.ts         # Schedule DTOs
│       ├── sales.types.ts            # Sales data
│       └── manager.types.ts          # Manager operations
│
├── scripts/                           # Development Scripts
│   ├── test-foundation.ts
│   ├── test-ai-generation.ts
│   ├── setup-test-data-for-ai.ts
│   └── (10+ more test scripts)
│
├── runpod-scripts/                    # RunPod Deployment
│   ├── start_services.sh
│   ├── watchdog.sh
│   └── DEPLOY.md
│
├── docs/                              # Documentation
│   ├── SHIFFY_BACKEND_DOCS.md        # Comprehensive docs (3290 lines)
│   ├── ROADMAP.md                    # Development roadmap (865 lines)
│   ├── CHANGELOG.md                  # Change log (966 lines)
│   ├── CLAUDE.md                     # AI dev guide
│   ├── RUNPOD_OLLAMA_SETUP.md        # Llama setup
│   ├── RUNPOD_PRODUCTION.md          # Production deployment
│   └── API_EMPLOYEE_CREATION.md      # API examples
│
├── database/                          # Database Scripts
│   └── (migration scripts)
│
├── package.json
├── tsconfig.json
├── .nvmrc                            # Node version lock (20.x)
├── .env.example
└── README.md                         # This file
```

---

## 🚀 Kurulum

### Ön Gereksinimler

```bash
Node.js >= 20.x (lockfile: .nvmrc)
npm >= 10.x
PostgreSQL veya Supabase hesabı
RunPod hesabı (AI için - opsiyonel development'ta mock kullanılabilir)
```

### Kurulum Adımları

```bash
# 1. Repository klonla
git clone https://github.com/ymcbzrgn/Shiffy.git
cd Shiffy/backend

# 2. Node version kontrolü (nvm kullanıyorsanız)
nvm use

# 3. Dependencies yükle
npm install

# 4. Environment variables oluştur
cp .env.example .env
nano .env
```

### Environment Variables

**`.env` Örneği:**

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Configuration (Employee Authentication)
JWT_SECRET=your-super-secret-256-bit-key-change-this-in-production
JWT_EXPIRY=7d

# RunPod Llama API (Optional - use mock if not available)
RUNPOD_API_URL=https://your-runpod-id.runpod.io
RUNPOD_API_KEY=your-runpod-api-key

# CORS Configuration
CORS_ORIGIN=http://localhost:8081,exp://192.168.1.100:8081

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Kritik Ayarlar:**
- `JWT_SECRET`: 256-bit random string (production'da mutlaka değiştirin!)
- `SUPABASE_SERVICE_ROLE_KEY`: Admin yetkili key (RLS bypass için)
- `CORS_ORIGIN`: Frontend URL'leri (development + production)

### TypeScript Derleme

```bash
# Build TypeScript → JavaScript
npm run build

# Output: dist/ klasörü
```

### Development Mode

```bash
# Nodemon + ts-node ile hot reload
npm run dev

# Server başlar: http://localhost:3000
```

### Production Mode

```bash
# Build + start compiled JS
npm run build
npm start

# PM2 ile production (önerilir)
pm2 start dist/server.js --name shiffy-backend -i max
```

---

## 📡 API Endpoints

### Health & Info

```http
GET /health                    # Health check
GET /                          # API info
```

### Authentication (Employee)

```http
POST /api/employee/login                    # Employee login
POST /api/employee/change-password          # First-time password change
```

**Request Body (Login):**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "employee": {
      "id": "uuid",
      "full_name": "John Doe",
      "username": "john_doe"
    }
  }
}
```

### Manager - Employee Management

```http
GET    /api/manager/employees              # List all employees
POST   /api/manager/employees              # Create employee
GET    /api/manager/employees/:id          # Get employee details
PATCH  /api/manager/employees/:id/notes    # Update manager notes
PATCH  /api/manager/employees/:id/toggle-status  # Active/inactive
```

**Create Employee:**
```json
{
  "full_name": "Jane Smith",
  "username": "jane_smith"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "uuid",
      "full_name": "Jane Smith",
      "username": "jane_smith",
      "password": "auto-generated-password",
      "is_active": true
    }
  }
}
```

### Shift Preferences

```http
POST /api/shifts/preferences       # Submit/update preferences (Employee)
GET  /api/shifts/my-preferences    # Get my preferences (Employee)
GET  /api/shifts/requests          # Get all employee preferences (Manager)
```

**Submit Preferences:**
```json
{
  "week_start": "2025-10-27",
  "preferences": {
    "monday": {
      "09:00": "available",
      "09:30": "available",
      "10:00": "unavailable",
      "14:00": "off_request"
    }
  }
}
```

### Schedule Management

```http
POST   /api/schedules/generate            # Generate AI schedule (Manager)
POST   /api/schedules/:id/approve         # Approve schedule (Manager)
PATCH  /api/schedules/:id/shifts          # Edit shifts (Manager)
GET    /api/schedules                     # Get manager schedules (Manager)
GET    /api/schedules/my-schedule         # Get my schedule (Employee)
```

**Generate Schedule:**
```json
{
  "week_start": "2025-10-27"
}
```

**AI Response:**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": "uuid",
      "week_start": "2025-10-27",
      "shifts": {
        "monday": [
          {
            "employee_id": "uuid",
            "employee_name": "John Doe",
            "start_time": "09:00",
            "end_time": "17:00"
          }
        ]
      },
      "status": "draft",
      "ai_generated": true
    }
  }
}
```

### Auto-Schedule (Cron Trigger)

```http
POST /api/auto-schedule/trigger-all    # Trigger all managers (Admin)
POST /api/auto-schedule/trigger-me     # Trigger my schedule (Manager)
GET  /api/auto-schedule/status         # Cron job status (Manager)
```

### Sales Reports

```http
POST   /api/sales-reports                  # Create daily report
GET    /api/sales-reports/daily/:date      # Get daily report
GET    /api/sales-reports/weekly/:weekStart # Get weekly summary
DELETE /api/sales-reports/:id              # Delete report
```

**Create Report:**
```json
{
  "report_date": "2025-10-26",
  "revenue": 15000.50,
  "transaction_count": 120,
  "notes": "Busy Saturday"
}
```

### Manager Settings

```http
GET   /api/manager/settings      # Get settings
PATCH /api/manager/settings      # Update settings
```

**Settings:**
```json
{
  "deadline_day": 4,
  "workdays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  "shift_duration": 30
}
```

---

## 🔐 Authentication

### Dual Authentication System

#### Manager Authentication (Supabase)
```typescript
// Frontend: Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'manager@example.com',
  password: 'password123'
});

// Backend: Verify via middleware
const { data: { user } } = await supabase.auth.getUser(token);
```

#### Employee Authentication (Custom JWT)
```typescript
// Backend: Generate JWT
const token = generateToken({
  user_id: employee.id,
  user_type: 'employee',
  username: employee.username
});

// Middleware: Verify JWT
const payload = verifyToken(token);
```

### Middleware Flow

```typescript
// 1. Extract Bearer token
const token = req.headers.authorization?.replace('Bearer ', '');

// 2. Try custom JWT (employees)
const jwtPayload = verifyToken(token);

// 3. If fails, try Supabase (managers)
const { data: { user } } = await supabase.auth.getUser(token);

// 4. Attach to req.user
req.user = { user_id, user_type, manager_id, username };
```

---

## 🗄️ Database Schema

### Tables (Supabase PostgreSQL)

```sql
-- Managers (Supabase Auth)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift Preferences
CREATE TABLE shift_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  preferences JSONB NOT NULL,
  is_submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, week_start)
);

-- Schedules
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  shifts JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Reports
CREATE TABLE sales_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  revenue DECIMAL(10,2),
  transaction_count INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(manager_id, report_date)
);

-- Manager Settings
CREATE TABLE manager_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  deadline_day INTEGER DEFAULT 4,
  workdays JSONB DEFAULT '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]',
  shift_duration INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_settings ENABLE ROW LEVEL SECURITY;

-- Example Policy
CREATE POLICY "Managers can only access their own employees"
  ON employees FOR ALL
  USING (auth.uid() = manager_id);
```

---

## 🤖 Llama AI Integration

### RunPod Setup

**Model:** Meta Llama 3.2 70B Instruct  
**Platform:** RunPod (self-hosted GPU instance)  
**GPU:** NVIDIA A40 (48GB VRAM)

**Setup Guide:** `docs/RUNPOD_OLLAMA_SETUP.md`

### Prompt Engineering

```typescript
const prompt = `
You are an AI shift scheduler for a business. Generate an optimal weekly shift schedule.

EMPLOYEE DATA:
${JSON.stringify(employees, null, 2)}

SHIFT PREFERENCES:
${JSON.stringify(preferences, null, 2)}

MANAGER NOTES:
${managerNotes}

BUSINESS RULES:
- Minimum 8 hours rest between shifts
- Maximum 40 hours per week per employee
- Fair distribution of weekend shifts
- Respect "off_request" preferences

OUTPUT FORMAT (JSON only):
{
  "shifts": {
    "monday": [
      {
        "employee_id": "uuid",
        "start_time": "09:00",
        "end_time": "17:00"
      }
    ]
  }
}
`;
```

### API Call

```typescript
const response = await fetch(`${RUNPOD_API_URL}/api/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RUNPOD_API_KEY}`
  },
  body: JSON.stringify({
    model: 'llama3.2:70b',
    prompt: prompt,
    stream: false
  })
});
```

### Mock Mode (Development)

```typescript
// services/llama.service.ts
const USE_MOCK = process.env.NODE_ENV === 'development';

if (USE_MOCK) {
  return generateMockSchedule(employees, preferences);
}
```

---

## ⏰ Cron Jobs

### Auto-Schedule Service

**Frequency:** Every Thursday 18:00 (configurable)

```typescript
// src/services/auto-schedule.service.ts
cron.schedule('0 18 * * 4', async () => {
  console.log('Running auto-schedule for all managers...');
  await autoScheduleService.runForAllManagers();
});
```

### Workflow

```
1. Cron triggers on deadline day
   ↓
2. Fetch all managers with settings
   ↓
3. For each manager:
   a. Check if deadline day matches
   b. Fetch employees + preferences
   c. Call Llama API
   d. Validate & save schedule
   ↓
4. Log results (success/failure)
   ↓
5. Notify managers (future: email/push)
```

### Manual Trigger

```bash
# Trigger all managers
curl -X POST http://localhost:3000/api/auto-schedule/trigger-all \
  -H "Authorization: Bearer <manager-token>"

# Trigger specific manager
curl -X POST http://localhost:3000/api/auto-schedule/trigger-me \
  -H "Authorization: Bearer <manager-token>"
```

---

## 🧪 Testing

### Health Check

```bash
# Server running?
curl http://localhost:3000/health

# Response:
{
  "status": "ok",
  "timestamp": "2025-10-26T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "port": 3000,
  "supabase": { "connected": true },
  "runpod": { "configured": true }
}
```

### Foundation Tests

```bash
# Run all foundation tests
npm run test:foundation

# Output: Tests for JWT, auth, CRUD operations
```

### Test Scripts

```bash
# Test employee creation
ts-node scripts/create-test-manager.ts

# Test AI generation
ts-node scripts/test-ai-generation.ts

# Test schedule approval
ts-node scripts/test-schedule-approval.ts

# Check database
npm run verify-db
```

### Manual API Testing

```bash
# 1. Login
curl -X POST http://localhost:3000/api/employee/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}'

# 2. Get token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Protected route
curl http://localhost:3000/api/shifts/my-preferences \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚢 Deployment

### Oracle Cloud Free Tier

**Instance:** VM.Standard.E2.1.Micro (4 vCPU, 24GB RAM)

```bash
# 1. SSH to instance
ssh ubuntu@<instance-ip>

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone repository
git clone https://github.com/ymcbzrgn/Shiffy.git
cd Shiffy/backend

# 5. Install dependencies
npm install

# 6. Create .env file
nano .env
# (Paste production credentials)

# 7. Build TypeScript
npm run build

# 8. Start with PM2
pm2 start dist/server.js --name shiffy-backend -i max

# 9. Save PM2 config
pm2 startup
pm2 save

# 10. Monitor
pm2 status
pm2 logs shiffy-backend
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/shiffy
server {
    listen 80;
    server_name api.shiffy.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/shiffy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.shiffy.com
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://production.supabase.co
SUPABASE_SERVICE_ROLE_KEY=production-key
JWT_SECRET=production-256-bit-secret
RUNPOD_API_URL=https://production-runpod.io
CORS_ORIGIN=https://shiffy.com,https://app.shiffy.com
```

---

## 📚 Dökümantasyon

### Kapsamlı Dökümantasyon

- **[SHIFFY_BACKEND_DOCS.md](./docs/SHIFFY_BACKEND_DOCS.md)** - 3290 satır teknik döküman
  - System overview
  - Architecture diagrams
  - Complete API reference
  - Database schema
  - Llama integration guide
  - Deployment instructions

- **[ROADMAP.md](./docs/ROADMAP.md)** - 865 satır development roadmap
  - Phase-by-phase breakdown
  - Time budgets
  - Current status
  - Task checklists

- **[CHANGELOG.md](./CHANGELOG.md)** - 966 satır development log
  - Phase 0-5 completion logs
  - File-by-file changes
  - API endpoint implementations

### Özel Guides

- **[RUNPOD_OLLAMA_SETUP.md](./docs/RUNPOD_OLLAMA_SETUP.md)** - Llama 3.2 70B kurulum
- **[RUNPOD_PRODUCTION.md](./docs/RUNPOD_PRODUCTION.md)** - Production deployment
- **[CLAUDE.md](./docs/CLAUDE.md)** - AI-assisted development patterns
- **[API_EMPLOYEE_CREATION.md](./docs/API_EMPLOYEE_CREATION.md)** - Employee API examples

---

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm start                # Run compiled JS

# Testing
npm run test:foundation  # Foundation tests
npm run verify-db        # Database verification

# Utilities
ts-node scripts/create-test-manager.ts        # Create test manager
ts-node scripts/setup-test-data-for-ai.ts     # Setup AI test data
ts-node scripts/test-ai-generation.ts         # Test Llama API
ts-node scripts/check-all-schedules.ts        # Check schedules
```

---

## 📊 Project Statistics

- **Total Files:** 100+ TypeScript files
- **API Endpoints:** 30+
- **Services:** 5 (auto-schedule, llama, schedule, shift, sales)
- **Middleware:** 2 (auth, error)
- **Routes:** 8 route files
- **Lines of Code:** ~15,000+ (src only)
- **Documentation:** ~5,000+ lines (docs/)

---

## 🤝 Katkıda Bulunma

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 Lisans

Bu proje **MIT License** ile lisanslanmıştır.

---

## 🙏 Teşekkürler

- **Meta** - Llama 3.2 70B modelini açık kaynak olarak sağladığı için
- **Supabase** - Backend-as-a-Service platformu için
- **RunPod** - GPU infrastructure için
- **YTU** - Hackathon'u düzenlediği için

---

<p align="center">
  Made with ❤️ during Meta & YTU Llama Hackathon 2025
</p>
<p align="center">
  🚀 Powered by Meta Llama 3.2 70B
</p>
