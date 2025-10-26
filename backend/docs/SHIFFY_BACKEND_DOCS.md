# Shiffy - Backend Technical Documentation
**Team:** Golden Head  
**Hackathon:** Meta & YTU Llama Hackathon 2025  
**Theme:** Productivity Tools  
**Tech Stack:** Node.js + Express + Supabase + RunPod Llama API

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [API Endpoints](#api-endpoints)
7. [Llama Integration](#llama-integration)
8. [Cron Job System](#cron-job-system)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)

---

## System Overview

### Backend Responsibilities
1. **Employee Authentication**: Custom JWT-based auth (separate from Supabase)
2. **Business Logic**: Shift request handling, validation, approval workflows
3. **AI Integration**: Communicate with Llama API for schedule generation
4. **Automated Processing**: Cron job triggers AI generation on deadline day
5. **Data Management**: CRUD operations for employees, shifts, schedules

### Technology Justification
**Why Node.js + Express?**
- Fast prototyping for hackathon timeline
- Native JSON handling (REST API)
- Excellent npm ecosystem for utilities
- Team expertise

**Why Supabase?**
- PostgreSQL with instant REST API
- Built-in auth for managers (zero setup)
- Row-level security (RLS) for data isolation
- Free tier sufficient for MVP

**Why Separate Employee Auth?**
- Supabase auth requires email (employees use usernames)
- B2B2C model: managers own employee accounts
- Different permission scopes (manager vs employee)

---

## Architecture

### System Diagram
```
┌─────────────┐
│ Mobile App  │
│  (Expo)     │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│      Express Server (Node.js)       │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Route Layer                 │  │
│  │  - /auth/*                   │  │
│  │  - /manager/*                │  │
│  │  - /shifts/*                 │  │
│  │  - /employee/*               │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│  ┌──────────▼───────────────────┐  │
│  │  Middleware Layer            │  │
│  │  - JWT Verification          │  │
│  │  - Error Handling            │  │
│  │  - Request Logging           │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│  ┌──────────▼───────────────────┐  │
│  │  Service Layer               │  │
│  │  - AuthService               │  │
│  │  - ShiftService              │  │
│  │  - EmployeeService           │  │
│  │  - LlamaService              │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│  ┌──────────▼───────────────────┐  │
│  │  Repository Layer            │  │
│  │  - Database queries          │  │
│  │  - Supabase client calls     │  │
│  └──────────────────────────────┘  │
└───────────┬────────────┬────────────┘
            │            │
            ▼            ▼
    ┌──────────────┐  ┌──────────────┐
    │   Supabase   │  │   RunPod     │
    │  PostgreSQL  │  │  Llama API   │
    └──────────────┘  └──────────────┘
            ▲
            │ Cron Trigger
    ┌───────┴──────┐
    │  Cron Job    │
    │  (node-cron) │
    └──────────────┘
```

### Design Principles
**Clean Architecture:**
- Separation of concerns (routes, services, repositories)
- Dependency injection for testability
- Single responsibility per module

**KISS (Keep It Simple):**
- No unnecessary abstractions (e.g., no ORM for simple queries)
- Direct Supabase client usage
- Minimal middleware chain

**Stateless API:**
- No session storage (JWT-based)
- Horizontal scaling ready
- Each request self-contained

---

## Project Structure

```
backend/
├── docs/                           # Backend-specific documentation
│   ├── API_REFERENCE.md           # Detailed endpoint specs
│   ├── DATABASE.md                # Schema & migrations
│   ├── LLAMA_INTEGRATION.md       # Prompt engineering guide
│   └── DEPLOYMENT.md              # Deployment instructions
│
├── test/                          # Tests mirror src/ structure
│   ├── unit/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── shifts.test.ts
│   │   └── employees.test.ts
│   └── e2e/
│       └── api.test.ts
│
├── src/
│   ├── routes/                    # API route handlers
│   │   ├── index.ts              # Main router
│   │   ├── auth.routes.ts        # /auth/*
│   │   ├── manager.routes.ts     # /manager/*
│   │   ├── employee.routes.ts    # /employee/*
│   │   └── shifts.routes.ts      # /shifts/*
│   │
│   ├── services/                  # Business logic layer
│   │   ├── auth.service.ts       # Employee auth logic
│   │   ├── employee.service.ts   # Employee CRUD
│   │   ├── shift.service.ts      # Shift management
│   │   └── llama.service.ts      # AI integration
│   │
│   ├── repositories/              # Data access layer
│   │   ├── employee.repository.ts
│   │   ├── shift.repository.ts
│   │   └── manager.repository.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── error.middleware.ts   # Error handling
│   │   └── logger.middleware.ts  # Request logging
│   │
│   ├── utils/
│   │   ├── jwt.utils.ts          # Token generation/validation
│   │   ├── password.utils.ts     # Bcrypt helpers
│   │   ├── validators.ts         # Input validation
│   │   └── constants.ts          # App-wide constants
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── shift.types.ts
│   │   └── api.types.ts
│   │
│   ├── config/
│   │   ├── supabase.config.ts    # Supabase client
│   │   ├── server.config.ts      # Express config
│   │   └── env.config.ts         # Environment variables
│   │
│   ├── cron/
│   │   └── shift-generation.cron.ts  # Automated AI triggers
│   │
│   └── server.ts                 # Entry point
│
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## Database Schema

### Supabase PostgreSQL Tables

#### 1. managers
**Purpose:** Store manager profiles (linked to Supabase Auth)

**Columns:**
```sql
CREATE TABLE managers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  deadline_day INTEGER NOT NULL DEFAULT 5, -- 1=Mon, 5=Fri
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_managers_email ON managers(email);
```

**Notes:**
- `id` references Supabase auth.users (automatic on manager register)
- `deadline_day` determines when cron job runs AI generation

---

#### 2. employees
**Purpose:** Store employee accounts (created by managers)

**Columns:**
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_login BOOLEAN DEFAULT TRUE,
  manager_notes TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active | inactive
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_username ON employees(username);
CREATE INDEX idx_employees_status ON employees(status);
```

**Notes:**
- `password_hash` uses bcrypt (cost factor 10)
- `first_login` forces password change on first access
- `manager_notes` used as input for Llama AI

---

#### 3. shift_preferences
**Purpose:** Store employee shift availability requests

**Columns:**
```sql
CREATE TABLE shift_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week
  slots JSONB NOT NULL, -- Array of {day, time, status}
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, week_start)
);

CREATE INDEX idx_preferences_employee ON shift_preferences(employee_id);
CREATE INDEX idx_preferences_week ON shift_preferences(week_start);
CREATE INDEX idx_preferences_submitted ON shift_preferences(submitted_at);
```

**JSONB Structure:**
```json
{
  "slots": [
    {
      "day": "monday",
      "time": "08:00-08:30",
      "status": "available" | "unavailable" | "off_request"
    }
  ]
}
```

**Notes:**
- `submitted_at` NULL = draft, NOT NULL = finalized
- UNIQUE constraint prevents duplicate submissions per week

---

#### 4. schedules
**Purpose:** Store AI-generated and approved shift schedules

**Columns:**
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending | generated | approved
  shifts JSONB NOT NULL, -- Array of assigned shifts
  ai_metadata JSONB, -- Store Llama response metadata
  generated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(manager_id, week_start)
);

CREATE INDEX idx_schedules_manager ON schedules(manager_id);
CREATE INDEX idx_schedules_week ON schedules(week_start);
CREATE INDEX idx_schedules_status ON schedules(status);
```

**JSONB Structure:**
```json
{
  "shifts": [
    {
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "day": "monday",
      "start_time": "09:00",
      "end_time": "17:00"
    }
  ],
  "ai_metadata": {
    "model": "llama-3.2-70b",
    "prompt_tokens": 1500,
    "response_tokens": 800,
    "generation_time_ms": 2500
  }
}
```

---

#### 5. audit_logs (Optional, for post-MVP)
**Purpose:** Track all modifications for compliance

**Columns:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL, -- manager | employee
  action VARCHAR(100) NOT NULL, -- login | create_employee | approve_schedule
  entity_type VARCHAR(50), -- employee | schedule | preference
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

---

### Row Level Security (RLS) Policies

**managers table:**
```sql
-- Managers can only read/update their own profile
CREATE POLICY manager_own_profile ON managers
  FOR ALL
  USING (auth.uid() = id);
```

**employees table:**
```sql
-- Managers can only access their own employees
CREATE POLICY manager_own_employees ON employees
  FOR ALL
  USING (manager_id = auth.uid());
```

**shift_preferences table:**
```sql
-- Employees can only access their own preferences
CREATE POLICY employee_own_preferences ON shift_preferences
  FOR ALL
  USING (employee_id IN (
    SELECT id FROM employees WHERE id = current_employee_id()
  ));

-- Managers can read preferences of their employees
CREATE POLICY manager_read_employee_preferences ON shift_preferences
  FOR SELECT
  USING (employee_id IN (
    SELECT id FROM employees WHERE manager_id = auth.uid()
  ));
```

**schedules table:**
```sql
-- Managers can only access their own schedules
CREATE POLICY manager_own_schedules ON schedules
  FOR ALL
  USING (manager_id = auth.uid());

-- Employees can read schedules from their manager
CREATE POLICY employee_read_schedules ON schedules
  FOR SELECT
  USING (manager_id IN (
    SELECT manager_id FROM employees WHERE id = current_employee_id()
  ));
```

---

## Authentication System

### Manager Authentication (Supabase)
**Handled by Supabase Auth** - No backend code needed for manager auth.

**Frontend → Supabase Direct:**
- Register: `supabase.auth.signUp()`
- Login: `supabase.auth.signInWithPassword()`
- Token refresh: Automatic

**Backend Role:**
- Create manager profile in `managers` table after Supabase signup
- Validate Supabase JWT in protected routes

---

### Employee Authentication (Custom JWT)

**Why Custom?**
- Supabase auth requires email (employees use usernames)
- Separate permission model
- Manager-controlled account lifecycle

**Implementation:**

#### Password Generation (on Employee Creation)
```
Algorithm:
1. Generate 8 random characters: [A-Za-z0-9]
2. Hash with bcrypt (cost factor 10)
3. Store hash in database
4. Return plaintext password to manager (display once)
```

**Security:**
- Passwords never stored in plaintext
- Temporary passwords force change on first login
- Bcrypt prevents rainbow table attacks

---

#### Login Flow
```
1. Employee sends: { username, password }
2. Backend:
   a. Query employee by username
   b. Compare password with bcrypt.compare()
   c. Check if account active
   d. Generate JWT (7-day expiry)
   e. Update last_login timestamp
   f. Return: { access_token, user_id, first_login }
3. If first_login=true:
   - Frontend redirects to change-password
   - Backend expects password change before other actions
```

---

#### JWT Structure
**Payload:**
```json
{
  "user_id": "uuid",
  "user_type": "employee",
  "manager_id": "uuid",
  "username": "john_doe",
  "iat": 1698765432,
  "exp": 1699370232
}
```

**Signing:**
- Algorithm: HS256
- Secret: 256-bit random key (from env)
- Expiry: 7 days (604800 seconds)

---

#### Password Change
```
1. Employee sends: { user_id, new_password }
2. Backend:
   a. Validate user_id matches JWT
   b. Check password strength (min 6 chars)
   c. Hash new password
   d. Update database
   e. Set first_login=false
   f. Return success
```

---

### Middleware: JWT Verification

**Purpose:** Protect routes requiring authentication

**Implementation Logic:**
```
1. Extract token from header: Authorization: Bearer <token>
2. Verify signature with JWT secret
3. Check expiry
4. Decode payload
5. Attach user info to request object: req.user = { user_id, user_type, ... }
6. Call next() or return 401 Unauthorized
```

**Route Protection:**
```typescript
// Manager-only routes
router.use('/manager/*', authMiddleware, managerOnlyMiddleware);

// Employee-only routes
router.use('/employee/*', authMiddleware, employeeOnlyMiddleware);

// Mixed access (validate type in controller)
router.use('/shifts/*', authMiddleware);
```

---

## API Endpoints

### Base URL
```
Development: http://localhost:3000
Production: https://api.shiffy.com
```

### Response Format
**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE" // Optional
}
```

---

### Authentication Endpoints

#### POST /auth/employee/login
**Purpose:** Employee login

**Request:**
```json
{
  "username": "john_doe",
  "password": "TempPass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "user_id": "uuid",
    "first_login": true
  }
}
```

**Errors:**
- 401: Invalid credentials
- 403: Account inactive

---

#### POST /auth/employee/change-password
**Purpose:** Change employee password (first login or anytime)

**Headers:**
```
Authorization: Bearer <employee_jwt>
```

**Request:**
```json
{
  "new_password": "MyNewPass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Validation:**
- Min 6 characters
- Cannot be same as old password

---

### Manager Endpoints

#### GET /manager/dashboard-stats
**Purpose:** Get dashboard overview stats

**Headers:**
```
Authorization: Bearer <supabase_jwt>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pending_requests": 5,
    "week_status": "pending",
    "employee_count": 12,
    "next_deadline": "2025-10-31"
  }
}
```

---

#### GET /manager/employees
**Purpose:** List all employees for manager

**Headers:**
```
Authorization: Bearer <supabase_jwt>
```

**Query Params:**
- `status`: optional, filter by active/inactive
- `search`: optional, search by name/username

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "uuid",
        "username": "john_doe",
        "full_name": "John Doe",
        "status": "active",
        "manager_notes": "Good with morning shifts",
        "last_login": "2025-10-24T10:30:00Z",
        "created_at": "2025-10-01T08:00:00Z"
      }
    ]
  }
}
```

---

#### POST /manager/employees
**Purpose:** Create new employee

**Headers:**
```
Authorization: Bearer <supabase_jwt>
```

**Request:**
```json
{
  "full_name": "John Doe",
  "username": "john_doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employee_id": "uuid",
    "username": "john_doe",
    "temp_password": "aB3dE9fG"
  }
}
```

**Business Logic:**
1. Validate username uniqueness (case-insensitive)
2. Generate random 8-char password
3. Hash password
4. Insert into employees table
5. Return credentials (password shown only once)

---

#### GET /manager/employees/:id
**Purpose:** Get employee details

**Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "uuid",
      "username": "john_doe",
      "full_name": "John Doe",
      "status": "active",
      "manager_notes": "Prefers evening shifts",
      "created_at": "2025-10-01T08:00:00Z",
      "last_login": "2025-10-24T10:30:00Z",
      "shift_history": [
        {
          "week_start": "2025-10-21",
          "total_hours": 24,
          "shift_count": 6
        }
      ]
    }
  }
}
```

---

#### PATCH /manager/employees/:id/notes
**Purpose:** Update manager notes for employee

**Request:**
```json
{
  "notes": "Good performance in morning shifts, reliable"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Notes updated successfully"
  }
}
```

---

#### DELETE /manager/employees/:id
**Purpose:** Delete employee (soft delete or hard delete based on requirements)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Employee deleted successfully"
  }
}
```

**Business Logic:**
- Check if employee has pending shifts
- Optionally prevent deletion if shifts exist (or warn manager)

---

#### GET /manager/settings
**Purpose:** Get manager settings

**Response:**
```json
{
  "success": true,
  "data": {
    "deadline_day": 5,
    "store_name": "Starbucks Kadıköy"
  }
}
```

---

#### PATCH /manager/settings
**Purpose:** Update manager settings

**Request:**
```json
{
  "deadline_day": 4,
  "store_name": "Starbucks Kadıköy Yeni"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Settings updated successfully"
  }
}
```

---

### Shift Endpoints

#### GET /shifts/requests?week=YYYY-MM-DD
**Purpose:** Get all shift preference requests for a week (Manager view)

**Headers:**
```
Authorization: Bearer <supabase_jwt>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "employee_id": "uuid",
        "employee_name": "John Doe",
        "submitted_at": "2025-10-24T14:00:00Z",
        "slots": [
          {
            "day": "monday",
            "time": "08:00-08:30",
            "status": "available"
          }
        ]
      }
    ]
  }
}
```

---

#### POST /shifts/generate-schedule
**Purpose:** Trigger AI to generate optimal schedule

**Headers:**
```
Authorization: Bearer <supabase_jwt>
```

**Request:**
```json
{
  "week_start": "2025-10-28",
  "manager_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": "uuid",
      "week_start": "2025-10-28",
      "status": "generated",
      "shifts": [
        {
          "employee_id": "uuid",
          "employee_name": "John Doe",
          "day": "monday",
          "start_time": "09:00",
          "end_time": "17:00"
        }
      ],
      "generated_at": "2025-10-26T10:00:00Z"
    }
  }
}
```

**Business Logic:**
1. Fetch all employee preferences for the week
2. Fetch manager notes for each employee
3. Build structured prompt for Llama
4. Call RunPod Llama API
5. Parse JSON response
6. Validate schedule (no conflicts, fair distribution)
7. Store in schedules table with status="generated"

---

#### PATCH /shifts/manual-edit
**Purpose:** Manually edit AI-generated schedule

**Request:**
```json
{
  "schedule_id": "uuid",
  "changes": [
    {
      "employee_id": "uuid",
      "day": "monday",
      "start_time": "10:00",
      "end_time": "18:00"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Schedule updated successfully"
  }
}
```

---

#### POST /shifts/approve
**Purpose:** Finalize and approve schedule

**Request:**
```json
{
  "schedule_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Schedule approved and sent to employees"
  }
}
```

**Business Logic:**
1. Update status to "approved"
2. Set approved_at timestamp
3. (Future: Send push notifications to employees)

---

#### GET /shifts/my-preferences?week=YYYY-MM-DD
**Purpose:** Get employee's own preferences (Employee view)

**Headers:**
```
Authorization: Bearer <employee_jwt>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preference": {
      "week_start": "2025-10-28",
      "slots": [
        {
          "day": "monday",
          "time": "08:00-08:30",
          "status": "available"
        }
      ],
      "submitted_at": "2025-10-24T14:00:00Z"
    }
  }
}
```

**Note:** Returns null if no preference exists yet (draft mode)

---

#### POST /shifts/preferences
**Purpose:** Submit shift preferences

**Headers:**
```
Authorization: Bearer <employee_jwt>
```

**Request:**
```json
{
  "week_start": "2025-10-28",
  "slots": [
    {
      "day": "monday",
      "time": "08:00-08:30",
      "status": "available"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Preferences submitted successfully"
  }
}
```

**Validation:**
- Cannot submit after deadline
- Min hours requirement (e.g., 20 hours available)

---

#### GET /shifts/my-shifts?week=YYYY-MM-DD
**Purpose:** Get employee's approved shifts

**Headers:**
```
Authorization: Bearer <employee_jwt>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shifts": [
      {
        "day": "monday",
        "start_time": "09:00",
        "end_time": "17:00"
      }
    ],
    "total_hours": 24
  }
}
```

---

#### GET /shifts/my-status?week=current
**Purpose:** Get current week status for employee dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "deadline": "2025-10-25T23:59:59Z",
    "approved": false,
    "preferences_submitted": true
  }
}
```

---

## Llama Integration

### RunPod Instance Setup (Your Own Deployment)

**Architecture:**
```
Backend (Oracle) ──HTTPS──> RunPod Llama Instance
                  (API Key Protected)
```

**Why Self-Hosted RunPod?**
- Full control over model and parameters
- No rate limits from shared services
- Dedicated GPU resources
- Custom API key protection
- Cost-effective for hackathon (pay-as-you-go)

---

### Setting Up Your RunPod Llama Instance

#### 1. Choose Model & GPU

**Model Options:**
- **Llama-3.2-70B-Instruct** - Best quality, slower (15-30s response)
- **Llama-3.2-8B-Instruct** - Faster (3-5s response), good quality
- **Llama-3.3-70B** - Latest, balanced performance

**GPU Requirements:**
- 70B model: A40 (48GB VRAM) or A100 (80GB VRAM)
- 8B model: RTX 4090 or A40
- **Recommended for MVP:** A40 with 70B model (~$0.60/hour)

#### 2. Deploy on RunPod

1. Go to https://www.runpod.io/console/pods
2. Click **+ Deploy** (or **GPU Pods → Deploy**)
3. Select GPU:
   - Filter by **48GB+ VRAM**
   - Sort by **$/hr**
   - Choose **A40** (most cost-effective)
4. Select Template:
   - Search for **"Text Generation Inference"** (TGI)
   - Or use **"vLLM"** template (alternative)
5. Configure:
   ```
   Container Image: ghcr.io/huggingface/text-generation-inference:latest
   Container Disk: 50 GB
   Volume Disk: None (not needed)
   Expose HTTP Ports: 80
   Expose TCP Ports: (leave empty)
   ```
6. Environment Variables:
   ```
   MODEL_ID=meta-llama/Llama-3.2-70B-Instruct
   MAX_INPUT_LENGTH=4096
   MAX_TOTAL_TOKENS=8192
   NUM_SHARD=1
   HUGGING_FACE_HUB_TOKEN=<your_hf_token>
   ```
   
   **Get HuggingFace Token:**
   - Go to https://huggingface.co/settings/tokens
   - Create token with "Read" permission
   - Accept Llama license at: https://huggingface.co/meta-llama/Llama-3.2-70B-Instruct

7. Click **Deploy On-Demand**

#### 3. Wait for Deployment
- Initial startup: 5-10 minutes (downloading model)
- Status: "Running" → Ready to use
- Copy **HTTP Service URL**: `https://xxx-80.proxy.runpod.net`

#### 4. Verify Instance is Running
```bash
curl https://your-pod-id-80.proxy.runpod.net/health

# Expected response:
# {"status":"ready"}
```

---

### API Integration from Backend

#### Environment Variables
```env
# .env in Oracle backend
RUNPOD_API_URL=https://your-pod-id-80.proxy.runpod.net
RUNPOD_API_KEY=your_custom_api_key_for_protection
```

#### Making Requests to RunPod

**Request Format (OpenAI-Compatible):**
```typescript
// src/services/llama.service.ts

const response = await fetch(`${process.env.RUNPOD_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'meta-llama/Llama-3.2-70B-Instruct',
    messages: [
      {
        role: 'system',
        content: 'You are a shift scheduling AI assistant.'
      },
      {
        role: 'user',
        content: promptText
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9,
  })
});

const data = await response.json();
const scheduleJSON = data.choices[0].message.content;
```

---

### Securing Your RunPod Instance

**Problem:** RunPod public URLs are accessible by anyone

**Solution Options:**

#### Option 1: Nginx Proxy on Oracle (Recommended)
Add authentication layer on your Oracle server:

```nginx
# /etc/nginx/sites-available/shiffy-backend

# Llama API proxy with auth
location /api/llama {
    # Check API key
    if ($http_x_api_key != "your_secure_random_key") {
        return 401 '{"error":"Unauthorized"}';
    }

    # Proxy to RunPod
    proxy_pass https://your-pod-id-80.proxy.runpod.net;
    proxy_http_version 1.1;
    
    # Remove API key before forwarding
    proxy_set_header X-API-Key "";
    
    # Timeouts for long AI responses
    proxy_connect_timeout 90s;
    proxy_send_timeout 90s;
    proxy_read_timeout 90s;
}
```

**Backend calls:**
```typescript
const response = await fetch('http://localhost/api/llama/v1/chat/completions', {
  headers: {
    'X-API-Key': process.env.RUNPOD_API_KEY,
    'Content-Type': 'application/json',
  },
  // ...
});
```

#### Option 2: IP Whitelist on RunPod
RunPod doesn't support IP whitelisting, so use Option 1.

#### Option 3: Backend-Only Access (Simplest for MVP)
- Only backend calls RunPod (never from frontend)
- Keep RunPod URL secret in backend .env
- Good enough for hackathon (not production-grade)

---

### Prompt Engineering for Shift Scheduling

#### System Prompt
```
You are an AI shift scheduler for retail stores. Your goal is to create fair and efficient weekly schedules based on employee availability and manager preferences.

CRITICAL RULES:
1. Output ONLY valid JSON (no explanations, no markdown)
2. Respect employee "unavailable" slots (never assign shifts during these times)
3. Prioritize "available" over "off_request" slots
4. Balance total hours fairly across all employees (within 20% variance)
5. Ensure minimum 8-hour rest between shifts for same employee
6. Consider manager notes (e.g., "better in morning shifts")

OUTPUT FORMAT:
{
  "shifts": [
    {
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "day": "monday",
      "start_time": "09:00",
      "end_time": "17:00"
    }
  ],
  "summary": {
    "total_hours_per_employee": {
      "uuid1": 35,
      "uuid2": 32
    },
    "unassigned_slots": []
  }
}
```

#### User Prompt Template
```typescript
const userPrompt = `
Generate weekly shift schedule for ${storeName}.

WEEK: ${weekStart} to ${weekEnd}
STORE HOURS: 08:00 - 23:00 daily

EMPLOYEES AND THEIR AVAILABILITY:
${employees.map(emp => `
Employee: ${emp.name} (ID: ${emp.id})
Manager Notes: ${emp.manager_notes || 'None'}
Availability:
${emp.preferences.map(slot => `  - ${slot.day} ${slot.time}: ${slot.status}`).join('\n')}
`).join('\n\n')}

REQUIREMENTS:
- Minimum 2 employees per shift slot
- Each employee should work 20-40 hours/week
- No back-to-back shifts without 8hr rest
- Fair distribution of weekend shifts

OUTPUT: JSON only (no explanations)
`;
```

#### Example Input
```json
{
  "store_name": "Starbucks Kadıköy",
  "week_start": "2025-10-28",
  "week_end": "2025-11-03",
  "employees": [
    {
      "id": "uuid1",
      "name": "Ali Yılmaz",
      "manager_notes": "Excellent with morning shifts, reliable",
      "preferences": [
        {"day": "monday", "time": "08:00-12:00", "status": "available"},
        {"day": "monday", "time": "12:00-16:00", "status": "unavailable"},
        {"day": "monday", "time": "16:00-20:00", "status": "off_request"}
      ]
    }
  ]
}
```

#### Parsing Response
```typescript
// Remove markdown code blocks if present
let content = llamaResponse.choices[0].message.content;
content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

// Parse JSON
const schedule = JSON.parse(content);

// Validate structure
if (!schedule.shifts || !Array.isArray(schedule.shifts)) {
  throw new Error('Invalid schedule format');
}

// Validate no conflicts
validateSchedule(schedule.shifts);

return schedule;
```

---

### Error Handling & Retries

#### Timeout Handling
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

try {
  const response = await fetch(RUNPOD_URL, {
    signal: controller.signal,
    // ...
  });
} catch (error) {
  if (error.name === 'AbortError') {
    // Retry with simpler prompt or fallback to 8B model
  }
} finally {
  clearTimeout(timeoutId);
}
```

#### Retry Logic
```typescript
async function generateScheduleWithRetry(data, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callLlamaAPI(data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}
```

---

### Cost Optimization

**RunPod Pricing (Approximate):**
- A40 GPU: ~$0.60/hour
- A100 GPU: ~$1.20/hour

**Cost Reduction Strategies:**
1. **Stop when not needed:**
   ```bash
   # Stop pod after hackathon hours
   # Restart before demo
   ```

2. **Use Spot Instances:**
   - 50-70% cheaper
   - Risk of interruption (not ideal for demo)

3. **Switch to 8B model for simple schedules:**
   ```typescript
   const employeeCount = employees.length;
   const model = employeeCount > 10 
     ? 'meta-llama/Llama-3.2-70B-Instruct'  // Complex
     : 'meta-llama/Llama-3.2-8B-Instruct';   // Simple
   ```

4. **Prompt caching:**
   - Cache system prompt (reuse for multiple requests)
   - Only send variable data in user prompt

**Estimated Hackathon Cost:**
- 48 hours runtime: 48 × $0.60 = $28.80
- With stop/start management: ~$15-20

---

### Testing Your RunPod Instance

#### Health Check
```bash
curl https://your-pod-id-80.proxy.runpod.net/health
```

#### Simple Generation Test
```bash
curl -X POST https://your-pod-id-80.proxy.runpod.net/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-3.2-70B-Instruct",
    "messages": [
      {"role": "user", "content": "Say hello in JSON format: {\"message\": \"...\"}"}
    ],
    "max_tokens": 50
  }'
```

**Expected Response:**
```json
{
  "id": "...",
  "choices": [
    {
      "message": {
        "content": "{\"message\": \"Hello! How can I assist you today?\"}"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  }
}
```

---

### Troubleshooting RunPod

**Issue:** Pod won't start
**Solution:** Check VRAM requirements, ensure HF token is valid

**Issue:** Timeout after 30s
**Solution:** Increase timeout to 90s, or switch to 8B model

**Issue:** Invalid JSON response
**Solution:** Improve system prompt, add JSON schema validation

**Issue:** Out of credits
**Solution:** Add more credits to RunPod account ($10 minimum)

---

### Alternative: Local Llama (Not Recommended for Hackathon)

If RunPod budget is an issue:
- Use **Ollama** on Oracle server (free but slow on CPU)
- Or use **Groq API** (free tier, but shared rate limits)

**Not recommended because:**
- Oracle CPU too slow for 70B model
- 8B model quality insufficient for complex scheduling
- Groq free tier has strict rate limits

---

## Cron Job System

### Purpose
Automatically trigger AI schedule generation on deadline day.

### Implementation: node-cron

**Cron Expression:**
```javascript
// Run every day at 00:00 (midnight)
'0 0 * * *'
```

**Logic:**
```
1. Get current day of week (1-7)
2. Query managers where deadline_day = current_day
3. For each manager:
   a. Get next week's date (week_start)
   b. Check if schedule already exists for that week
   c. If not exists AND all employees submitted preferences:
      - Call shift generation service
      - Store schedule with status="generated"
      - (Future: Send notification to manager)
   d. If missing preferences:
      - Log warning
      - (Future: Send reminder notification)
```

**Error Handling:**
- If generation fails for one manager, continue with others
- Log all errors to database
- Send alert to ops team if >50% failures

---

### Cron Job File Structure

```typescript
// src/cron/shift-generation.cron.ts

import cron from 'node-cron';
import { shiftService } from '../services/shift.service';
import { managerRepository } from '../repositories/manager.repository';

export function startShiftGenerationCron() {
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Shift generation job started');
    
    try {
      const currentDay = new Date().getDay(); // 0=Sun, 6=Sat
      const managers = await managerRepository.findByDeadlineDay(currentDay);
      
      for (const manager of managers) {
        try {
          await shiftService.autoGenerateSchedule(manager.id);
          console.log(`[CRON] Generated schedule for manager ${manager.id}`);
        } catch (error) {
          console.error(`[CRON] Failed for manager ${manager.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[CRON] Shift generation job failed:', error);
    }
  });
}
```

---

## Testing Strategy

### Test Pyramid
```
           /\
          /  \
         / E2E \        10% - Full API flows
        /______\
       /        \
      /Integration\     30% - Service layer + DB
     /____________\
    /              \
   /  Unit Tests    \   60% - Pure functions, utils
  /__________________\
```

### Unit Tests

**Coverage Target:** 80%

**Focus Areas:**
- Utils (password generation, JWT, validators)
- Service layer (business logic)
- Middleware (auth, error handling)

**Example:**
```typescript
// test/unit/utils/password.utils.test.ts
describe('generateTempPassword', () => {
  it('should generate 8-character password', () => {
    const password = generateTempPassword();
    expect(password).toHaveLength(8);
  });

  it('should only contain alphanumeric characters', () => {
    const password = generateTempPassword();
    expect(password).toMatch(/^[A-Za-z0-9]+$/);
  });
});
```

---

### Integration Tests

**Focus:**
- API endpoints with real database (test DB)
- Service layer with mocked external APIs

**Example:**
```typescript
// test/integration/auth.test.ts
describe('POST /auth/employee/login', () => {
  it('should return JWT for valid credentials', async () => {
    const response = await request(app)
      .post('/auth/employee/login')
      .send({ username: 'test_user', password: 'password123' });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('access_token');
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/employee/login')
      .send({ username: 'test_user', password: 'wrongpass' });
    
    expect(response.status).toBe(401);
  });
});
```

---

### E2E Tests

**Scope:** Complete user flows

**Example Flow:**
1. Manager registers
2. Manager creates employee
3. Employee logs in (first_login=true)
4. Employee changes password
5. Employee submits preferences
6. Manager generates schedule
7. Manager approves schedule
8. Employee views approved shifts

---

### Test Database

**Setup:**
- Use separate Supabase project for testing
- Reset database before each test suite
- Seed with test data (faker.js)

**Cleanup:**
- Rollback transactions after each test
- Or truncate tables after test suite

---

## Deployment

### Primary Deployment: Oracle Cloud Free Tier

**Why Oracle Cloud?**
- **Forever Free Tier:** 2 AMD-based VMs or 4 ARM-based Ampere A1 cores
- **Generous Resources:** Up to 24 GB RAM, 200 GB storage
- **No Credit Card Expiry:** Unlike AWS/GCP free tiers
- **Full Control:** Root access, no cold starts, persistent processes
- **HTTP Endpoint:** Easy to expose with public IP

**Specs (Always Free):**
- **Compute:** 4 OCPUs (ARM Ampere A1) + 24 GB RAM
- **Storage:** 200 GB block volume
- **Network:** 10 TB outbound transfer/month
- **OS:** Ubuntu 22.04 LTS

---

### Step-by-Step Oracle Cloud Setup

#### 1. Create Oracle Cloud Account
1. Go to https://www.oracle.com/cloud/free/
2. Sign up (no credit card required after trial)
3. Verify email

#### 2. Create Compute Instance
1. Navigate to **Compute → Instances**
2. Click **Create Instance**
3. Configure:
   - **Name:** shiffy-backend
   - **Image:** Ubuntu 22.04 (Minimal)
   - **Shape:** VM.Standard.A1.Flex
   - **OCPUs:** 4
   - **Memory:** 24 GB
   - **VCN:** Create new (default settings)
   - **Public IP:** Assign automatically
4. **Add SSH Key:** Upload your public key or generate new
5. Click **Create**

#### 3. Configure Security Rules (Firewall)
1. Go to **VCN Details → Security Lists → Default Security List**
2. Click **Add Ingress Rules**
3. Add rules:

**HTTP (Port 80):**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port: 80
```

**HTTPS (Port 443):**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port: 443
```

**SSH (Port 22):** Already exists by default

#### 4. SSH into Instance
```bash
ssh -i ~/.ssh/id_rsa ubuntu@<PUBLIC_IP>
```

#### 5. Server Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v  # Should show v20.x
npm -v   # Should show v10.x

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

#### 6. Configure Firewall (Ubuntu UFW)
```bash
# Allow OpenSSH
sudo ufw allow OpenSSH

# Allow Nginx
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

#### 7. Clone and Setup Backend
```bash
# Create app directory
sudo mkdir -p /var/www/shiffy
sudo chown -R $USER:$USER /var/www/shiffy

# Clone repository
cd /var/www/shiffy
git clone <your-repo-url> .

# Navigate to backend
cd backend

# Install dependencies
npm install

# Create production .env file
nano .env
```

**.env Content:**
```env
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# JWT
JWT_SECRET=your_256_bit_random_secret
JWT_EXPIRY=7d

# RunPod Llama (your own instance)
RUNPOD_API_URL=https://your-instance-id.runpod.net/v1/chat/completions
RUNPOD_API_KEY=your_runpod_api_key

# CORS
CORS_ORIGIN=https://shiffy.com,exp://192.168.1.100:8081

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

```bash
# Build TypeScript
npm run build

# Test server locally
npm start
# Should see: "Server running on port 3000"

# Stop test (Ctrl+C)
```

#### 8. Setup PM2 Process Manager
```bash
# Start backend with PM2
pm2 start dist/server.js --name shiffy-backend

# Configure PM2 to restart on system reboot
pm2 startup systemd
# Copy and run the command it outputs

# Save PM2 process list
pm2 save

# Check status
pm2 status
pm2 logs shiffy-backend

# Monitor in real-time
pm2 monit
```

**PM2 Useful Commands:**
```bash
pm2 restart shiffy-backend    # Restart app
pm2 stop shiffy-backend        # Stop app
pm2 delete shiffy-backend      # Remove from PM2
pm2 logs shiffy-backend --lines 100  # View logs
```

#### 9. Configure Nginx Reverse Proxy
```bash
# Remove default Nginx config
sudo rm /etc/nginx/sites-enabled/default

# Create new config
sudo nano /etc/nginx/sites-available/shiffy-backend
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name <YOUR_PUBLIC_IP>;  # Or your domain if you have one

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket support (future)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts (important for AI generation)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/shiffy-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

#### 10. Verify Deployment
```bash
# Test from server
curl http://localhost:3000/health

# Test from outside (replace with your public IP)
curl http://<PUBLIC_IP>/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T...",
  "uptime": 123.456
}
```

---

### SSL/HTTPS Setup (Optional but Recommended)

#### Using Let's Encrypt (Free SSL)
**Prerequisites:** You need a domain name pointing to your Oracle Cloud IP

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.shiffy.com

# Auto-renewal (Certbot handles this automatically)
sudo certbot renew --dry-run
```

**Nginx will auto-update to:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.shiffy.com;

    ssl_certificate /etc/letsencrypt/live/api.shiffy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.shiffy.com/privkey.pem;
    
    # ... rest of config
}

server {
    listen 80;
    server_name api.shiffy.com;
    return 301 https://$server_name$request_uri;
}
```

---

### RunPod Llama Instance Setup

#### 1. Create RunPod Account
- Go to https://www.runpod.io
- Sign up and add credits ($10 minimum)

#### 2. Deploy Llama Instance
1. Navigate to **Pods → Deploy Pod**
2. Select **Template: Text Generation Inference (TGI)**
3. Configure:
   - **GPU:** A40 or A100 (recommend A40 for cost)
   - **Model:** `meta-llama/Llama-3.2-70B-Instruct`
   - **Container Disk:** 50 GB
   - **Expose Ports:** Enable HTTP (port 80)
4. **Environment Variables:**
   ```
   MODEL_ID=meta-llama/Llama-3.2-70B-Instruct
   MAX_INPUT_LENGTH=4096
   MAX_TOTAL_TOKENS=8192
   ```
5. Click **Deploy**

#### 3. Get API Endpoint
- Once running, copy the **HTTP Service** URL
- Format: `https://<pod-id>-80.proxy.runpod.net`

#### 4. Secure with API Key
RunPod doesn't have built-in API key auth, so implement in backend:

**Backend Middleware:**
```typescript
// src/middleware/runpod.middleware.ts
export function validateRunPodKey(req, res, next) {
  const apiKey = req.headers['x-runpod-api-key'];
  
  if (!apiKey || apiKey !== process.env.RUNPOD_API_KEY) {
    return res.status(401).json({ error: 'Invalid RunPod API key' });
  }
  
  next();
}
```

**Or Use Nginx Auth (on Oracle server):**
```nginx
location /llama {
    proxy_pass https://your-pod-id.runpod.net;
    
    # Simple API key validation
    if ($http_x_api_key != "your_secure_api_key") {
        return 401;
    }
}
```

#### 5. Test RunPod Connection
```bash
curl -X POST https://your-pod-id.runpod.net/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-3.2-70B-Instruct",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

---

### Continuous Deployment (Git Push → Auto Update)

#### Setup Git Webhook
```bash
# Create deploy script
nano /var/www/shiffy/backend/deploy.sh
```

**deploy.sh:**
```bash
#!/bin/bash
cd /var/www/shiffy/backend
git pull origin main
npm install
npm run build
pm2 restart shiffy-backend
echo "Deployment completed at $(date)"
```

```bash
# Make executable
chmod +x /var/www/shiffy/backend/deploy.sh

# Test manual deployment
./deploy.sh
```

**Manual Deployment Process:**
```bash
ssh ubuntu@<ORACLE_IP>
cd /var/www/shiffy/backend
./deploy.sh
```

---

### Alternative Deployment Options

#### Option 2: Vercel (Serverless) - Not Recommended for MVP
**Limitations:**
- 10s function timeout (AI generation might take longer)
- Cold starts (poor UX)
- No persistent cron jobs

**Use Case:** Only if you separate AI generation to a different service

---

#### Option 3: Docker on Oracle (Advanced)
If you prefer containerization:

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Deploy:**
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Build and run
docker build -t shiffy-backend .
docker run -d \
  --name shiffy-backend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  shiffy-backend

# Check logs
docker logs -f shiffy-backend
```

---

### Environment Variables

**Location:** `/var/www/shiffy/backend/.env` (on Oracle server)

**Required Variables:**
```env
# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
NODE_ENV=production
PORT=3000

# =============================================================================
# SUPABASE (Database & Manager Auth)
# =============================================================================
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Note: Use SERVICE ROLE KEY (not anon key)
# Find at: Supabase Dashboard → Settings → API → service_role key

# =============================================================================
# JWT (Employee Authentication)
# =============================================================================
JWT_SECRET=your_256_bit_random_secret_key_here
JWT_EXPIRY=7d

# Generate secure secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# =============================================================================
# RUNPOD LLAMA API (Your Own Instance)
# =============================================================================
RUNPOD_API_URL=https://xxxxxx-80.proxy.runpod.net
RUNPOD_API_KEY=your_custom_api_key_for_protection

# Get from: RunPod Dashboard → Your Pod → HTTP Service URL
# API Key: Your own key for backend → RunPod protection (set your own)

# =============================================================================
# CORS (Cross-Origin Resource Sharing)
# =============================================================================
# Allow frontend origins (comma-separated)
CORS_ORIGIN=https://shiffy.com,https://www.shiffy.com,exp://192.168.1.100:8081

# For development (allow all): CORS_ORIGIN=*
# For production: Specify exact domains

# =============================================================================
# RATE LIMITING (DDoS Protection)
# =============================================================================
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes (in milliseconds)
RATE_LIMIT_MAX_REQUESTS=100        # Max 100 requests per window

# Adjust based on usage:
# - Development: 1000 requests
# - Production: 100-200 requests

# =============================================================================
# CRON JOB CONFIGURATION
# =============================================================================
CRON_ENABLED=true                  # Enable/disable automatic shift generation
CRON_TIMEZONE=Europe/Istanbul      # Your timezone

# =============================================================================
# LOGGING
# =============================================================================
LOG_LEVEL=info                     # debug | info | warn | error
LOG_FILE_PATH=./logs               # Log file directory

# =============================================================================
# OPTIONAL: ERROR TRACKING
# =============================================================================
# SENTRY_DSN=https://xxx@sentry.io/xxx
# SENTRY_ENVIRONMENT=production

# =============================================================================
# OPTIONAL: NOTIFICATIONS
# =============================================================================
# DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

---

#### Generating Secure Secrets

**JWT Secret (256-bit):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Random API Key:**
```bash
openssl rand -base64 32
```

---

#### Environment-Specific Configs

**.env.development (local testing):**
```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://test-project.supabase.co
SUPABASE_SERVICE_KEY=test_key
JWT_SECRET=development_secret_do_not_use_in_production
JWT_EXPIRY=7d
RUNPOD_API_URL=http://localhost:8000  # Or mock server
RUNPOD_API_KEY=dev_key
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000  # Higher for dev
CRON_ENABLED=false  # Disable cron in development
LOG_LEVEL=debug
```

**.env.production (Oracle server):**
```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://production-project.supabase.co
SUPABASE_SERVICE_KEY=<real_key>
JWT_SECRET=<real_secret>
JWT_EXPIRY=7d
RUNPOD_API_URL=https://your-pod-id.runpod.net
RUNPOD_API_KEY=<real_key>
CORS_ORIGIN=https://shiffy.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CRON_ENABLED=true
LOG_LEVEL=info
```

---

#### Security Best Practices

**1. Never Commit .env to Git:**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

**2. Use .env.example (template):**
```bash
# Create example file
cp .env .env.example

# Replace real values with placeholders
sed -i 's/=.*/=your_value_here/' .env.example

# Commit example
git add .env.example
```

**3. Set Correct File Permissions:**
```bash
# Only owner can read .env
chmod 600 /var/www/shiffy/backend/.env

# Verify
ls -la .env
# Should show: -rw------- (600)
```

**4. Rotate Secrets Regularly:**
- JWT Secret: Every 3 months
- API Keys: After hackathon (if made public)
- Supabase Keys: If compromised

---

#### Loading Environment Variables

**In Node.js (using dotenv):**
```typescript
// src/config/env.config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiry: process.env.JWT_EXPIRY || '7d',
  },
  
  runpod: {
    apiUrl: process.env.RUNPOD_API_URL!,
    apiKey: process.env.RUNPOD_API_KEY!,
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  cron: {
    enabled: process.env.CRON_ENABLED === 'true',
    timezone: process.env.CRON_TIMEZONE || 'UTC',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },
};

// Validate required variables
function validateEnv() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'JWT_SECRET',
    'RUNPOD_API_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateEnv();
```

---

#### Troubleshooting Environment Variables

**Issue:** "Missing required environment variables"
**Solution:**
```bash
# Check if .env file exists
ls -la /var/www/shiffy/backend/.env

# Check file content (be careful, contains secrets!)
cat .env

# Restart PM2 to reload env
pm2 restart shiffy-backend --update-env
```

**Issue:** CORS errors in frontend
**Solution:**
```bash
# Check CORS_ORIGIN setting
grep CORS_ORIGIN .env

# Update to include frontend URL
nano .env
# Add: CORS_ORIGIN=https://your-frontend-domain.com,exp://192.168.1.100:8081

# Restart
pm2 restart shiffy-backend
```

**Issue:** Supabase connection fails
**Solution:**
```bash
# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
supabase.from('managers').select('count').then(console.log);
"
```

---

### CI/CD Pipeline (GitHub Actions → Oracle Cloud)

**Deployment Strategy:**
- Push to `main` branch triggers auto-deployment
- Tests run first (fail = no deploy)
- SSH into Oracle server and update code

---

#### Setup GitHub Secrets

1. Go to GitHub repo → **Settings → Secrets and variables → Actions**
2. Add secrets:

```
ORACLE_HOST=<your_oracle_public_ip>
ORACLE_USER=ubuntu
ORACLE_SSH_KEY=<private_key_content>
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
JWT_SECRET=xxx
RUNPOD_API_URL=https://xxx.runpod.net
RUNPOD_API_KEY=xxx
```

**Get SSH Private Key:**
```bash
# On your local machine
cat ~/.ssh/id_rsa
# Copy entire content (including -----BEGIN RSA PRIVATE KEY-----)
```

---

#### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy Backend to Oracle Cloud

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Run linter
        working-directory: ./backend
        run: npm run lint
      
      - name: Run tests
        working-directory: ./backend
        run: npm test
        env:
          NODE_ENV: test
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          JWT_SECRET: test_secret

  deploy:
    name: Deploy to Oracle Cloud
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.ORACLE_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.ORACLE_HOST }} >> ~/.ssh/known_hosts
      
      - name: Deploy to server
        env:
          ORACLE_HOST: ${{ secrets.ORACLE_HOST }}
          ORACLE_USER: ${{ secrets.ORACLE_USER }}
        run: |
          ssh -i ~/.ssh/id_rsa $ORACLE_USER@$ORACLE_HOST << 'EOF'
            cd /var/www/shiffy/backend
            
            # Pull latest code
            git pull origin main
            
            # Install dependencies
            npm install
            
            # Build TypeScript
            npm run build
            
            # Update environment variables
            cat > .env << ENV
            NODE_ENV=production
            PORT=3000
            SUPABASE_URL=${{ secrets.SUPABASE_URL }}
            SUPABASE_SERVICE_KEY=${{ secrets.SUPABASE_SERVICE_KEY }}
            JWT_SECRET=${{ secrets.JWT_SECRET }}
            JWT_EXPIRY=7d
            RUNPOD_API_URL=${{ secrets.RUNPOD_API_URL }}
            RUNPOD_API_KEY=${{ secrets.RUNPOD_API_KEY }}
            CORS_ORIGIN=*
            ENV
            
            # Restart PM2 process
            pm2 restart shiffy-backend
            
            # Check if running
            sleep 3
            pm2 status shiffy-backend
            
            # Test health endpoint
            curl -f http://localhost:3000/health || exit 1
            
            echo "Deployment completed successfully at $(date)"
          EOF
      
      - name: Deployment status
        if: success()
        run: echo "✅ Backend deployed successfully to Oracle Cloud"
      
      - name: Deployment failed
        if: failure()
        run: |
          echo "❌ Deployment failed!"
          exit 1

  notify:
    name: Notify Team
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Discord notification
        env:
          DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK_URL }}
        run: |
          STATUS="${{ needs.deploy.result }}"
          if [ "$STATUS" == "success" ]; then
            COLOR="3066993"
            MESSAGE="✅ Backend deployed successfully"
          else
            COLOR="15158332"
            MESSAGE="❌ Deployment failed"
          fi
          
          curl -H "Content-Type: application/json" \
            -d "{\"embeds\":[{\"title\":\"Shiffy Backend Deployment\",\"description\":\"$MESSAGE\",\"color\":$COLOR}]}" \
            $DISCORD_WEBHOOK
```

---

#### Manual Deployment Script

**For emergency/hotfix deployments:**

```bash
# deploy.sh (on local machine)
#!/bin/bash

echo "🚀 Deploying Shiffy Backend to Oracle Cloud..."

# Configuration
ORACLE_HOST="your_oracle_ip"
ORACLE_USER="ubuntu"
SSH_KEY="~/.ssh/id_rsa"

# Deploy
ssh -i $SSH_KEY $ORACLE_USER@$ORACLE_HOST << 'EOF'
  cd /var/www/shiffy/backend
  git pull origin main
  npm install
  npm run build
  pm2 restart shiffy-backend
  pm2 logs shiffy-backend --lines 20
EOF

echo "✅ Deployment completed!"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

---

#### Rollback Strategy

**If deployment breaks production:**

```bash
# SSH into Oracle server
ssh ubuntu@<oracle_ip>
cd /var/www/shiffy/backend

# Rollback to previous commit
git log --oneline -5  # Find previous commit hash
git reset --hard <previous_commit_hash>

# Rebuild and restart
npm install
npm run build
pm2 restart shiffy-backend

# Verify
curl http://localhost:3000/health
```

**Or use PM2 revert:**
```bash
pm2 reload shiffy-backend --update-env
```

---

#### Zero-Downtime Deployment (Advanced)

**Using PM2 Cluster Mode:**

```bash
# Start with 2 instances
pm2 start dist/server.js -i 2 --name shiffy-backend

# Deploy updates (graceful reload)
pm2 reload shiffy-backend
```

**How it works:**
1. PM2 reloads instance 1 (instance 2 handles traffic)
2. Once instance 1 is ready, reload instance 2
3. No downtime during deployment

---

#### Environment-Specific Deployments

**Staging Environment (Optional):**

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    # ... similar to production but different server
    env:
      ORACLE_HOST: ${{ secrets.STAGING_ORACLE_HOST }}
```

---

#### Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing locally
- [ ] Database migrations ready (if any)
- [ ] Environment variables updated
- [ ] Backup current version (git tag)

**During Deployment:**
- [ ] Monitor PM2 logs: `pm2 logs shiffy-backend`
- [ ] Check health endpoint
- [ ] Verify frontend can connect

**Post-Deployment:**
- [ ] Test critical endpoints (login, shift generation)
- [ ] Monitor error logs for 15 minutes
- [ ] Notify team in Discord

---

#### Troubleshooting Deployment Issues

**Issue:** SSH connection failed
**Solution:** 
```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa ubuntu@<oracle_ip> "echo 'Connection OK'"

# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa
```

**Issue:** Git pull fails (merge conflicts)
**Solution:**
```bash
# On Oracle server
cd /var/www/shiffy/backend
git stash          # Save local changes
git pull origin main
git stash pop      # Reapply changes (if needed)
```

**Issue:** npm install hangs
**Solution:**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue:** PM2 restart fails
**Solution:**
```bash
# Kill all PM2 processes
pm2 kill
pm2 start dist/server.js --name shiffy-backend

# Or check for port conflicts
sudo lsof -i :3000
```

---

### Monitoring & Logging (Oracle Cloud)

#### PM2 Process Monitoring

**Real-Time Monitoring:**
```bash
# Dashboard view (CPU, Memory, Uptime)
pm2 monit

# Process list
pm2 status

# Detailed info
pm2 info shiffy-backend

# Resource usage
pm2 describe shiffy-backend
```

**Logs:**
```bash
# View all logs
pm2 logs shiffy-backend

# Last 100 lines
pm2 logs shiffy-backend --lines 100

# Only errors
pm2 logs shiffy-backend --err

# Stream logs in real-time
pm2 logs shiffy-backend --raw

# Clear logs
pm2 flush
```

**PM2 Log Files Location:**
```
/home/ubuntu/.pm2/logs/
├── shiffy-backend-out.log    # stdout
└── shiffy-backend-error.log  # stderr
```

**Log Rotation (Prevent disk fill):**
```bash
# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M      # Rotate when file > 10MB
pm2 set pm2-logrotate:retain 7          # Keep 7 days of logs
pm2 set pm2-logrotate:compress true     # Gzip old logs
```

---

#### Nginx Access & Error Logs

**Log Locations:**
```
/var/log/nginx/
├── access.log   # All HTTP requests
└── error.log    # Nginx errors
```

**View Logs:**
```bash
# Real-time access log
sudo tail -f /var/log/nginx/access.log

# Real-time error log
sudo tail -f /var/log/nginx/error.log

# Search for specific IP
sudo grep "123.45.67.89" /var/log/nginx/access.log

# Count requests by endpoint
sudo awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
```

**Log Format (Custom for API monitoring):**
```nginx
# Add to /etc/nginx/nginx.conf in http block
log_format api_log '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_user_agent" $request_time';

# Use in server block
access_log /var/log/nginx/shiffy-api.log api_log;
```

---

#### Application Logging (Backend)

**Winston Logger Setup:**
```bash
npm install winston
```

**Configuration:**
```typescript
// src/config/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

**Usage in Code:**
```typescript
import logger from './config/logger';

logger.info('Employee created', { employee_id, manager_id });
logger.error('Llama API timeout', { error, duration_ms: 60000 });
```

---

#### Health Check Endpoint

**Implementation:**
```typescript
// GET /health
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const { error: dbError } = await supabase
      .from('managers')
      .select('count')
      .limit(1);

    // Check RunPod availability
    const runpodHealthy = await checkRunPodHealth();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      },
      database: dbError ? 'error' : 'connected',
      llama: runpodHealthy ? 'available' : 'unavailable',
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});
```

**Automated Health Checks (Cron):**
```bash
# Add to crontab
crontab -e

# Ping health endpoint every 5 minutes
*/5 * * * * curl -f http://localhost:3000/health || echo "Backend unhealthy" | mail -s "Alert" admin@shiffy.com
```

---

#### Error Tracking (Optional: Sentry)

**Setup:**
```bash
npm install @sentry/node
```

**Integration:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error middleware
app.use(Sentry.Handlers.errorHandler());
```

**Benefits:**
- Real-time error notifications
- Stack traces with context
- Performance monitoring

---

#### Disk Space Monitoring

**Check Disk Usage:**
```bash
# Overall disk usage
df -h

# Find large directories
du -sh /var/log/* | sort -rh | head -10

# Find large files
find / -type f -size +100M 2>/dev/null
```

**Auto-Cleanup Script:**
```bash
# /home/ubuntu/cleanup.sh
#!/bin/bash

# Delete logs older than 7 days
find /var/log/nginx/ -name "*.log" -mtime +7 -delete
find ~/.pm2/logs/ -name "*.log" -mtime +7 -delete

# Clear old npm cache
npm cache clean --force

echo "Cleanup completed at $(date)"
```

```bash
# Schedule daily cleanup
crontab -e
0 2 * * * /home/ubuntu/cleanup.sh >> /var/log/cleanup.log 2>&1
```

---

#### Performance Monitoring

**Basic Metrics:**
```bash
# CPU & Memory usage
htop

# Network connections
netstat -tuln | grep 3000

# Active requests
pm2 status
```

**Node.js Performance:**
```typescript
// Add to server.ts
setInterval(() => {
  const memUsage = process.memoryUsage();
  logger.info('Performance metrics', {
    heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
    uptime_hours: Math.round(process.uptime() / 3600),
    active_requests: server.connections
  });
}, 60000); // Log every minute
```

---

#### Alert System (Simple)

**Webhook to Discord/Slack:**
```typescript
async function sendAlert(message: string) {
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🚨 Shiffy Backend Alert: ${message}`
    })
  });
}

// Use in critical errors
try {
  await generateSchedule();
} catch (error) {
  logger.error('Schedule generation failed', { error });
  await sendAlert(`Schedule generation failed: ${error.message}`);
}
```

---

#### Database Monitoring (Supabase Dashboard)

**Access:**
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Database → Logs**

**Metrics to Monitor:**
- Active connections
- Slow queries (>1s)
- Database size
- Table bloat

---

#### Quick Troubleshooting Commands

**Backend not responding:**
```bash
pm2 restart shiffy-backend
pm2 logs shiffy-backend --err --lines 50
```

**High memory usage:**
```bash
pm2 describe shiffy-backend
# If memory leak suspected:
pm2 restart shiffy-backend
```

**Nginx issues:**
```bash
sudo nginx -t                 # Test config
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Database connection issues:**
```bash
# Test from server
curl -X POST http://localhost:3000/auth/employee/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

---

## Security Considerations

### Best Practices
1. **Environment Variables:** Never commit secrets to git
2. **CORS:** Whitelist only frontend domains
3. **Rate Limiting:** Prevent brute force attacks
4. **Input Validation:** Sanitize all user inputs
5. **SQL Injection:** Use parameterized queries (Supabase handles this)
6. **XSS Prevention:** Validate/escape JSON responses
7. **HTTPS Only:** Enforce SSL in production

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/auth/', limiter);
```

---

## Performance Optimization

### Database Indexes
- Already defined in schema (see Database Schema section)

### Caching Strategy
- Cache employee lists in memory (5-minute TTL)
- Cache manager settings (invalidate on update)

### Connection Pooling
- Supabase handles connection pooling automatically
- Max pool size: 15 (free tier limit)

---

## MVP Checklist

### Must-Have (P0)
- [ ] Employee auth (login, password change)
- [ ] Manager employee CRUD
- [ ] Shift preference submission
- [ ] AI schedule generation (Llama integration)
- [ ] Schedule approval
- [ ] All API endpoints functional
- [ ] Database migrations deployed
- [ ] Cron job for auto-generation
- [ ] Deployment to Oracle/Vercel

### Nice-to-Have (P1)
- [ ] Request logging
- [ ] Error tracking (Sentry)
- [ ] Rate limiting
- [ ] API documentation (Swagger)

### Post-MVP (P2)
- [ ] Push notifications
- [ ] Audit logs
- [ ] Advanced analytics
- [ ] WebSocket for real-time updates

---

## Development Guidelines

### Code Style
- **Naming:** camelCase for variables/functions, PascalCase for types
- **Async/Await:** Prefer over promises/callbacks
- **Error Handling:** Try-catch in all async functions
- **Comments:** Only for complex logic, prefer self-documenting code

### Git Workflow
**Branch Naming:**
```
feature/employee-auth
feature/shift-service
fix/jwt-expiry
hotfix/cron-job-crash
```

**Commit Messages:**
```
[Backend] Implement employee login endpoint
[Backend] Fix JWT token validation bug
[Backend] Add Llama API integration
[Backend] Optimize shift query performance
```

---

## Troubleshooting

### Common Issues

**Issue:** Supabase connection fails
**Solution:** Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in .env

**Issue:** Llama API timeout
**Solution:** Increase timeout to 60s, or switch to 8B model

**Issue:** Cron job not running
**Solution:** Check server timezone, verify cron expression

**Issue:** JWT expired errors
**Solution:** Implement refresh token logic (post-MVP)

---

## API Documentation Tool

**Swagger Setup (Optional):**
```bash
npm install swagger-ui-express swagger-jsdoc
```

**Access:** `http://localhost:3000/api-docs`

---

## Support & Resources

**Documentation:**
- Supabase: https://supabase.com/docs
- Express: https://expressjs.com
- Llama API: https://runpod.io/docs
- Node-cron: https://www.npmjs.com/package/node-cron

**Team Resources:**
- Frontend API Contract: `/docs/API.md`
- Database Schema: `/docs/DATABASE.md`
- Discord: #shiffy-backend

---

**Document Version:** 1.0.0  
**Last Updated:** October 24, 2025  
**Maintainers:** Backend Team (Golden Head)  
**Next Review:** Post-MVP (October 27, 2025)