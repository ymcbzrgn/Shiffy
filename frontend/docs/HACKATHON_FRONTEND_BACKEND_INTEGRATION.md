# Shiffy Frontend-Backend Integration Guide

**Created:** October 25, 2025
**Purpose:** Migrate frontend from 100% mock data to real backend API integration
**Target:** Complete integration for hackathon demo
**Status:** Backend 100% complete ✅ | Frontend needs migration ⚠️

---

## Table of Contents

1. [Current State & Architecture](#1-current-state--architecture)
2. [Environment Setup](#2-environment-setup)
3. [API Endpoint Reference](#3-api-endpoint-reference)
4. [Service Migration Guide](#4-service-migration-guide)
5. [Testing Checklist](#5-testing-checklist)
6. [Troubleshooting](#6-troubleshooting)
7. [Next Steps](#7-next-steps)

---

## 1. Current State & Architecture

### Backend Status: ✅ 100% COMPLETE

**Technology:** Node.js + Express + TypeScript + Supabase PostgreSQL

**All 13 Endpoints Working:**
- ✅ Manager Auth (Supabase): Signup, Login
- ✅ Employee Auth (Custom JWT): Login, Change Password
- ✅ Employee CRUD: Create, Read, Update, Toggle Status
- ✅ Shift Preferences: Submit, View (employee/manager)
- ✅ AI Schedule: Generate, Approve, View

**Recent Changes:**
- ✅ Migration 003 completed: Added `job_description` and `max_weekly_hours` to employees table
- ✅ All TypeScript types updated across layers
- ✅ API validation added (max_weekly_hours: 0-150)
- ✅ AI scheduler updated to use new fields

**Running:**
```bash
cd backend
npm run dev  # Runs on http://localhost:3000
```

---

### Frontend Status: ⚠️ NEEDS MIGRATION

**Technology:** React Native + Expo Router + TypeScript + NativeWind

**Current State:**
- ⚠️ **ALL services using `USE_MOCK = true`**
- ⚠️ Mock authentication (hardcoded credentials)
- ⚠️ Mock employee data (static arrays)
- ⚠️ Mock API delays (`setTimeout`)
- ⚠️ No real database connection

**Files Needing Migration:**
1. `frontend/services/auth.ts` - Manager auth (Supabase)
2. `frontend/services/employee-auth.ts` - Employee auth (custom JWT)
3. `frontend/services/employee.ts` - Employee CRUD operations
4. **NEW:** `frontend/services/shift.ts` - Shift preferences (needs creation)
5. **NEW:** `frontend/services/schedule.ts` - AI schedule operations (needs creation)
6. **NEW:** `frontend/services/api-client.ts` - Shared API client (needs creation)

**Running:**
```bash
cd frontend
npm start  # Runs on http://localhost:19000 (Expo DevTools)
```

---

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React Native + Expo)                             │
│  - User Interface (Manager + Employee screens)              │
│  - State Management (React hooks)                           │
│  - Service Layer (CURRENTLY MOCK, NEEDS MIGRATION)          │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Express + TypeScript)                             │
│  ├── Routes (API endpoints)                                 │
│  ├── Middleware (JWT auth)                                  │
│  ├── Services (Business logic)                              │
│  ├── Repositories (Database queries)                        │
│  └── External: Llama API (RunPod)                           │
└─────────────────────────────────────────────────────────────┘
                           ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│  SUPABASE (PostgreSQL + Auth)                               │
│  ├── managers (Supabase Auth users)                         │
│  ├── employees (Custom auth)                                │
│  ├── shift_preferences (JSONB slots)                        │
│  └── schedules (AI-generated shifts)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Setup

### 2.1 Backend Environment Variables

**File:** `backend/.env.local`

```bash
# Server
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Supabase (Manager Auth + Database)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here  # NOT anon key!

# JWT (Employee Auth)
JWT_SECRET=your_256_bit_random_secret_here  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_EXPIRY=7d

# RunPod Llama API
RUNPOD_API_URL=https://your-pod-id-8888.proxy.runpod.net
RUNPOD_API_KEY=your_custom_api_key_here

# CORS (Allow frontend origin)
CORS_ORIGIN=http://localhost:3000,http://localhost:19000,exp://192.168.1.100:8081

# Logging
LOG_LEVEL=debug
```

**Setup Steps:**
1. Copy `backend/.env.example` to `backend/.env.local`
2. Fill in your Supabase credentials from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
3. Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Add your RunPod endpoint URL and API key
5. Update CORS_ORIGIN to include your local network IP if testing on mobile device

---

### 2.2 Frontend Environment Variables

**File:** `frontend/.env`

```bash
# API Base URL (Backend)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# For testing on physical device, use your computer's local IP:
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000
```

**Setup Steps:**
1. Create `frontend/.env` file
2. Set `EXPO_PUBLIC_API_BASE_URL` to backend URL
3. For physical device testing:
   - Find your computer's IP: `ifconfig | grep "inet "` (macOS/Linux) or `ipconfig` (Windows)
   - Update to: `EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:3000`
4. Restart Expo server after changing .env

**Accessing in Code:**
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
```

---

## 3. API Endpoint Reference

### 3.1 Manager Authentication (Supabase)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Manager registration (Supabase) | None |
| POST | `/auth/signInWithPassword` | Manager login (Supabase) | None |

**Note:** Manager auth uses Supabase Auth directly (not custom backend endpoint).

---

### 3.2 Employee Authentication (Custom JWT)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/employee/login` | Employee login | `{ username, password }` | `{ success, data: { token, employee } }` |
| POST | `/api/employee/change-password` | Change password | `{ old_password, new_password }` | `{ success, message }` |

**Authentication:** Include `Authorization: Bearer <token>` header for `/change-password`.

---

### 3.3 Employee CRUD (Manager Only)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/manager/employees` | List all employees | - | `{ success, data: Employee[] }` |
| POST | `/api/manager/employees` | Create employee | `{ full_name, username, job_description?, max_weekly_hours? }` | `{ success, data: { employee, temp_password } }` |
| GET | `/api/manager/employees/:id` | Get single employee | - | `{ success, data: Employee }` |
| PATCH | `/api/manager/employees/:id/notes` | Update notes | `{ notes }` | `{ success, data: Employee }` |
| PATCH | `/api/manager/employees/:id/status` | Toggle status | - | `{ success, data: Employee }` |

**Authentication:** Manager JWT required (from Supabase).

**NEW FIELDS (October 25, 2025):**
- `job_description`: VARCHAR(255), nullable (e.g., "Cashier, Server")
- `max_weekly_hours`: INTEGER 0-150, nullable (0 = on leave, NULL = no limit)

---

### 3.4 Shift Preferences (Employee)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/shifts/preferences` | Submit preferences | `{ week_start, slots: TimeSlot[] }` | `{ success, data: ShiftPreference }` |
| GET | `/api/shifts/my-preferences?week_start=YYYY-MM-DD` | Get my preferences | - | `{ success, data: ShiftPreference \| null }` |

**Authentication:** Employee JWT required.

**TimeSlot Format:**
```typescript
{
  day: 'monday' | 'tuesday' | ... | 'sunday',
  time: 'HH:MM',  // e.g., '08:00'
  status: 'available' | 'unavailable' | 'off_request' | null
}
```

---

### 3.5 Shift Preferences (Manager View)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/shifts/requests?week_start=YYYY-MM-DD` | View all employee preferences | `{ success, data: { employee_id, full_name, slots, submitted_at }[] }` |

**Authentication:** Manager JWT required.

---

### 3.6 Schedule Operations (AI)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/schedules/generate` | Generate AI schedule | `{ week_start }` | `{ success, data: ScheduleResponse }` |
| POST | `/api/schedules/:id/approve` | Approve schedule | - | `{ success, data: ScheduleResponse }` |
| GET | `/api/schedules?week_start=YYYY-MM-DD` | Get manager's schedule | - | `{ success, data: ScheduleResponse \| null }` |
| GET | `/api/schedules/my-schedule?week_start=YYYY-MM-DD` | Get employee's shifts | - | `{ success, data: MyScheduleResponse \| null }` |

**Authentication:**
- Generate, Approve, Manager view: Manager JWT required
- Employee view: Employee JWT required

**ScheduleResponse:**
```typescript
{
  id: string;
  week_start: string;
  status: 'pending' | 'generated' | 'approved';
  shifts: AssignedShift[];
  summary: {
    total_shifts: number;
    total_hours: number;
    coverage_score: number;
    warnings: string[];
  };
  generated_at: string;
  approved_at: string | null;
}
```

---

## 4. Service Migration Guide

### PHASE 1: Create API Client Helper

**File:** `frontend/services/api-client.ts` (NEW)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch wrapper with automatic token injection
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  try {
    // Get stored token (if exists)
    const token = await AsyncStorage.getItem('auth_token');

    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse JSON response
    const data = await response.json();

    // Return response (backend already uses { success, data, error } format)
    return data;

  } catch (error) {
    console.error('API Client Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network request failed',
    };
  }
}

/**
 * Save authentication token
 */
export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem('auth_token', token);
}

/**
 * Clear authentication token (logout)
 */
export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem('auth_token');
}

/**
 * Get current token
 */
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('auth_token');
}
```

**Action:**
- [x] Create this file in `frontend/services/api-client.ts`
- [x] Verify AsyncStorage is installed: `@react-native-async-storage/async-storage` (already in package.json)

---

### PHASE 2: Migrate Manager Auth (Supabase)

**File:** `frontend/services/auth.ts` (MODIFY)

**Current State:** Mock auth with `USE_MOCK = true`

**Steps:**

1. **Install Supabase Client:**
```bash
cd frontend
npm install @supabase/supabase-js
```

2. **Create Supabase Config:**

Create `frontend/config/supabase.config.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://your-project-id.supabase.co';  // Same as backend
const SUPABASE_ANON_KEY = 'your_anon_public_key_here';  // Get from Supabase dashboard

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**IMPORTANT:** Use **anon key** for frontend (not service key).

3. **Replace `auth.ts`:**

```typescript
import { supabase } from '../config/supabase.config';
import { Manager } from '../types';
import { saveToken, clearToken } from './api-client';

/**
 * Manager Login (Supabase Auth)
 */
export async function loginManager(
  email: string,
  password: string
): Promise<{ manager: Manager; token: string }> {
  // Sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user || !data.session) {
    throw new Error('Login failed');
  }

  // Save token for API requests
  await saveToken(data.session.access_token);

  // Fetch manager profile from database
  const { data: managerData, error: profileError } = await supabase
    .from('managers')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !managerData) {
    throw new Error('Failed to fetch manager profile');
  }

  return {
    manager: managerData as Manager,
    token: data.session.access_token,
  };
}

/**
 * Manager Registration (Supabase Auth)
 */
export async function registerManager(
  storeName: string,
  email: string,
  password: string
): Promise<{ manager: Manager; token: string }> {
  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user || !data.session) {
    throw new Error('Registration failed');
  }

  // Create manager profile
  const { data: managerData, error: profileError } = await supabase
    .from('managers')
    .insert({
      id: data.user.id,
      email,
      store_name: storeName,
      subscription_status: 'trial',
      subscription_tier: 'basic',
    })
    .select()
    .single();

  if (profileError || !managerData) {
    throw new Error('Failed to create manager profile');
  }

  // Save token
  await saveToken(data.session.access_token);

  return {
    manager: managerData as Manager,
    token: data.session.access_token,
  };
}

/**
 * Logout (clear session)
 */
export async function logoutManager(): Promise<void> {
  await supabase.auth.signOut();
  await clearToken();
}
```

**Action:**
- [x] Remove `USE_MOCK` flag
- [x] Remove all mock data (`MOCK_MANAGER`, mock delays)
- [x] Replace with real Supabase calls
- [x] Test login with real Supabase account

---

### PHASE 3: Migrate Employee Auth (Custom JWT)

**File:** `frontend/services/employee-auth.ts` (MODIFY)

**Steps:**

```typescript
import { apiClient, saveToken, clearToken } from './api-client';

interface LoginResponse {
  token: string;
  employee: {
    id: string;
    username: string;
    full_name: string;
    first_login: boolean;
  };
}

interface ChangePasswordResponse {
  message: string;
}

/**
 * Employee Login (Custom JWT)
 */
export async function employeeLogin(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiClient<LoginResponse>('/api/employee/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Login failed');
  }

  // Save token for future requests
  await saveToken(response.data.token);

  return response.data;
}

/**
 * Employee Change Password (Requires auth)
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<string> {
  const response = await apiClient<ChangePasswordResponse>('/api/employee/change-password', {
    method: 'POST',
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Password change failed');
  }

  return response.data.message;
}

/**
 * Employee Logout
 */
export async function employeeLogout(): Promise<void> {
  await clearToken();
}
```

**Action:**
- [x] Remove `USE_MOCK` flag
- [x] Remove `MOCK_CREDENTIALS` object
- [x] Replace with real API calls via `apiClient`
- [x] Test login with real employee account (created by manager)

---

### PHASE 4: Migrate Employee Service (CRUD)

**File:** `frontend/services/employee.ts` (MODIFY)

**Steps:**

```typescript
import { apiClient } from './api-client';
import { Employee } from '../types';

/**
 * Get All Employees (Manager Only)
 */
export async function getEmployees(): Promise<Employee[]> {
  const response = await apiClient<Employee[]>('/api/manager/employees', {
    method: 'GET',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch employees');
  }

  return response.data;
}

/**
 * Search Employees (Client-side filtering)
 */
export async function searchEmployees(query: string): Promise<Employee[]> {
  const employees = await getEmployees();

  if (!query) return employees;

  const lowerQuery = query.toLowerCase();
  return employees.filter(emp =>
    emp.full_name.toLowerCase().includes(lowerQuery) ||
    emp.username.toLowerCase().includes(lowerQuery) ||
    emp.job_description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get Single Employee
 */
export async function getEmployee(employeeId: string): Promise<Employee> {
  const response = await apiClient<Employee>(`/api/manager/employees/${employeeId}`, {
    method: 'GET',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch employee');
  }

  return response.data;
}

/**
 * Create Employee (Manager Only)
 * NEW FIELDS: job_description, max_weekly_hours
 */
export async function createEmployee(
  fullName: string,
  username: string,
  jobDescription: string | null = null,
  maxWeeklyHours: number | null = null
): Promise<{ employee: Employee; tempPassword: string }> {
  const response = await apiClient<{ employee: Employee; temp_password: string }>(
    '/api/manager/employees',
    {
      method: 'POST',
      body: JSON.stringify({
        full_name: fullName,
        username,
        job_description: jobDescription,
        max_weekly_hours: maxWeeklyHours,
      }),
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create employee');
  }

  return {
    employee: response.data.employee,
    tempPassword: response.data.temp_password,
  };
}

/**
 * Update Employee Notes
 */
export async function updateEmployeeNotes(
  employeeId: string,
  notes: string
): Promise<Employee> {
  const response = await apiClient<Employee>(
    `/api/manager/employees/${employeeId}/notes`,
    {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update notes');
  }

  return response.data;
}

/**
 * Toggle Employee Status (active/inactive)
 */
export async function toggleEmployeeStatus(employeeId: string): Promise<Employee> {
  const response = await apiClient<Employee>(
    `/api/manager/employees/${employeeId}/status`,
    {
      method: 'PATCH',
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to toggle status');
  }

  return response.data;
}
```

**Action:**
- [x] Remove `USE_MOCK` flag
- [x] Remove `MOCK_EMPLOYEES` array
- [x] Replace all functions with real API calls
- [x] **IMPORTANT:** Add `job_description` and `max_weekly_hours` parameters to `createEmployee`
- [x] Test creating employee with new fields

---

### PHASE 5: Create Shift Service (NEW)

**File:** `frontend/services/shift.ts` (CREATE)

```typescript
import { apiClient } from './api-client';
import { ShiftPreference, TimeSlot } from '../types';

/**
 * Submit Shift Preferences (Employee)
 */
export async function submitPreferences(
  weekStart: string,
  slots: TimeSlot[]
): Promise<ShiftPreference> {
  const response = await apiClient<ShiftPreference>('/api/shifts/preferences', {
    method: 'POST',
    body: JSON.stringify({
      week_start: weekStart,
      slots,
    }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to submit preferences');
  }

  return response.data;
}

/**
 * Get My Preferences (Employee)
 */
export async function getMyPreferences(weekStart: string): Promise<ShiftPreference | null> {
  const response = await apiClient<ShiftPreference | null>(
    `/api/shifts/my-preferences?week_start=${weekStart}`,
    {
      method: 'GET',
    }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch preferences');
  }

  return response.data || null;
}

/**
 * Get All Employee Preferences (Manager)
 */
export async function getShiftRequests(weekStart: string): Promise<any[]> {
  const response = await apiClient<any[]>(
    `/api/shifts/requests?week_start=${weekStart}`,
    {
      method: 'GET',
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch shift requests');
  }

  return response.data;
}
```

**Action:**
- [x] Create this new file
- [x] Export functions in existing screens that use shift preferences

---

### PHASE 6: Create Schedule Service (NEW)

**File:** `frontend/services/schedule.ts` (CREATE)

```typescript
import { apiClient } from './api-client';
import { WeekSchedule, AssignedShift } from '../types';

interface ScheduleResponse {
  id: string;
  week_start: string;
  status: 'pending' | 'generated' | 'approved';
  shifts: AssignedShift[];
  summary?: {
    total_shifts: number;
    total_hours: number;
    coverage_score: number;
    warnings: string[];
  };
  generated_at: string;
  approved_at: string | null;
}

interface MyScheduleResponse {
  week_start: string;
  shifts: AssignedShift[];
  status: 'pending' | 'generated' | 'approved';
}

/**
 * Generate AI Schedule (Manager Only)
 */
export async function generateSchedule(weekStart: string): Promise<ScheduleResponse> {
  const response = await apiClient<ScheduleResponse>('/api/schedules/generate', {
    method: 'POST',
    body: JSON.stringify({ week_start: weekStart }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to generate schedule');
  }

  return response.data;
}

/**
 * Approve Schedule (Manager Only)
 */
export async function approveSchedule(scheduleId: string): Promise<ScheduleResponse> {
  const response = await apiClient<ScheduleResponse>(`/api/schedules/${scheduleId}/approve`, {
    method: 'POST',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to approve schedule');
  }

  return response.data;
}

/**
 * Get Manager's Schedule (All employees, any status)
 */
export async function getManagerSchedule(weekStart: string): Promise<ScheduleResponse | null> {
  const response = await apiClient<ScheduleResponse | null>(
    `/api/schedules?week_start=${weekStart}`,
    {
      method: 'GET',
    }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch schedule');
  }

  return response.data || null;
}

/**
 * Get Employee's Schedule (Only approved, only their shifts)
 */
export async function getMySchedule(weekStart: string): Promise<MyScheduleResponse | null> {
  const response = await apiClient<MyScheduleResponse | null>(
    `/api/schedules/my-schedule?week_start=${weekStart}`,
    {
      method: 'GET',
    }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch schedule');
  }

  return response.data || null;
}
```

**Action:**
- [x] Create this new file
- [x] Update manager dashboard to use `generateSchedule` and `approveSchedule`
- [x] Update employee shift screen to use `getMySchedule`

---

### PHASE 7: Update Frontend Types (Sync with Backend)

**File:** `frontend/types/index.ts` (MODIFY)

**Verify these fields exist:**

```typescript
export interface Employee {
  id: string;
  manager_id: string;
  username: string;
  full_name: string;
  job_description: string | null;  // ✅ Should already exist
  max_weekly_hours: number | null; // ⚠️ ADD THIS IF MISSING
  first_login: boolean;
  manager_notes: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  last_login: string | null;
}
```

**Action:**
- [x] Add `max_weekly_hours: number | null;` if missing
- [x] Verify `job_description` exists (should already be there)

---

## 5. Testing Checklist

### 5.1 Pre-Testing Setup

**Backend:**
```bash
cd backend

# 1. Ensure .env.local is configured
cat .env.local  # Verify SUPABASE_URL, JWT_SECRET, etc.

# 2. Start backend server
npm run dev

# Expected output:
# Server running on port 3000
# Supabase connected
```

**Frontend:**
```bash
cd frontend

# 1. Ensure .env is configured
cat .env  # Verify EXPO_PUBLIC_API_BASE_URL

# 2. Install dependencies (if not done)
npm install

# 3. Start Expo server
npm start

# Expected output:
# Metro waiting on exp://192.168.x.x:19000
# Scan QR code with Expo Go app
```

---

### 5.2 Manager Flow Testing

**Test 1: Manager Registration**
- [ ] Open app → "Yönetici Girişi" (Manager Login)
- [ ] Click "Kayıt Ol" (Register)
- [ ] Fill form (store name, email, password)
- [ ] Submit → Should create Supabase account
- [ ] Verify: Redirects to manager dashboard
- [ ] Verify: Token saved (check AsyncStorage or login persists)

**Test 2: Manager Login**
- [ ] Logout
- [ ] Login with registered email/password
- [ ] Verify: Supabase authentication works
- [ ] Verify: Manager dashboard loads

**Test 3: Create Employee (WITH NEW FIELDS)**
- [ ] Manager dashboard → "Çalışanlar" (Employees)
- [ ] Click "Yeni Çalışan Ekle" (Add Employee)
- [ ] Fill form:
  - [x] Full name: "Test Employee"
  - [x] Username: "test.employee"
  - [x] **Job description: "Cashier, Barista"** (NEW FIELD)
  - [x] **Max weekly hours: 40** (NEW FIELD)
- [ ] Submit → Should create employee
- [ ] Verify: Temporary password displayed (copy it!)
- [ ] Verify: Employee appears in list with job_description and max_weekly_hours

**Test 4: Update Employee Notes**
- [ ] Click on employee
- [ ] Add note: "Test note from frontend"
- [ ] Save → Should update
- [ ] Verify: Note persists after refresh

**Test 5: Toggle Employee Status**
- [ ] Click "Deaktif Et" (Deactivate)
- [ ] Verify: Status changes to "inactive"
- [ ] Click "Aktif Et" (Activate)
- [ ] Verify: Status changes back to "active"

---

### 5.3 Employee Flow Testing

**Test 6: Employee Login**
- [ ] Logout from manager account
- [ ] Go to "Çalışan Girişi" (Employee Login)
- [ ] Login with:
  - Username: `test.employee` (created above)
  - Password: `<temp_password>` (from step 3)
- [ ] Verify: Login succeeds
- [ ] If `first_login: true`, should prompt password change

**Test 7: Employee Password Change**
- [ ] Employee dashboard → Profile
- [ ] Click "Şifre Değiştir" (Change Password)
- [ ] Fill:
  - Old password: `<temp_password>`
  - New password: `NewPassword123!`
- [ ] Submit → Should succeed
- [ ] Logout and login with new password
- [ ] Verify: New password works

**Test 8: Submit Shift Preferences**
- [ ] Employee dashboard → "Vardiya Tercihleri" (Shift Preferences)
- [ ] Select week (e.g., 2025-01-27)
- [ ] Mark availability slots:
  - Monday 08:00: Available
  - Tuesday 14:00: Unavailable
  - Wednesday 08:00: Off Request
- [ ] Submit → Should save preferences
- [ ] Verify: Backend receives data (check manager view)

**Test 9: View My Schedule (After AI Generation)**
- [ ] Employee dashboard → "Vardiyalarım" (My Shifts)
- [ ] Select week
- [ ] Should display: "Henüz vardiya atanmadı" (if no schedule approved yet)
- [ ] After manager approves schedule → Should show assigned shifts

---

### 5.4 AI Schedule Testing

**Test 10: Generate Schedule (Manager)**
- [ ] Manager dashboard → "Vardiya Planlama" (Schedule Planning)
- [ ] Select week (must have employee preferences submitted)
- [ ] Click "AI ile Oluştur" (Generate with AI)
- [ ] Wait for AI generation (30-60 seconds)
- [ ] Verify: Schedule appears with shifts
- [ ] Verify: Summary shows total_shifts, total_hours, coverage_score
- [ ] Verify: Status is "generated" (not yet approved)

**Test 11: Approve Schedule**
- [ ] Click "Onayla" (Approve)
- [ ] Verify: Status changes to "approved"
- [ ] Verify: `approved_at` timestamp is set

**Test 12: Employee Views Approved Schedule**
- [ ] Login as employee
- [ ] Go to "Vardiyalarım" (My Shifts)
- [ ] Verify: Only approved schedules are visible
- [ ] Verify: Only employee's own shifts are shown (not other employees)

---

### 5.5 Edge Cases & Error Handling

**Test 13: Network Errors**
- [ ] Stop backend server (`Ctrl+C`)
- [ ] Try to login → Should show error: "Network request failed"
- [ ] Restart backend
- [ ] Retry → Should work

**Test 14: Invalid Credentials**
- [ ] Try employee login with wrong password
- [ ] Verify: Error message: "Kullanıcı adı veya şifre hatalı"
- [ ] Try manager login with wrong email
- [ ] Verify: Supabase error displayed

**Test 15: Validation Errors**
- [ ] Try to create employee with `max_weekly_hours: 200` (exceeds 150)
- [ ] Verify: Backend returns 400 error
- [ ] Verify: Frontend displays error message

**Test 16: Token Expiration**
- [ ] Login as employee
- [ ] Manually clear token: `AsyncStorage.removeItem('auth_token')`
- [ ] Try to submit shift preferences
- [ ] Verify: 401 Unauthorized error
- [ ] Verify: Redirects to login screen

---

## 6. Troubleshooting

### Issue 1: "Network request failed"

**Cause:** Frontend can't reach backend.

**Solutions:**
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check `EXPO_PUBLIC_API_BASE_URL` in frontend/.env
3. If testing on physical device:
   - Use computer's local IP: `http://192.168.x.x:3000`
   - Ensure backend CORS allows this IP
4. Check firewall settings (allow port 3000)

---

### Issue 2: CORS Error

**Symptom:** Console shows: `Access to fetch at 'http://localhost:3000/api/...' has been blocked by CORS`

**Solution:**
1. Check backend `CORS_ORIGIN` in `.env.local`:
```bash
CORS_ORIGIN=http://localhost:3000,http://localhost:19000,exp://192.168.1.100:8081
```
2. Add your Expo DevTools URL to CORS_ORIGIN
3. Restart backend server

---

### Issue 3: "401 Unauthorized"

**Cause:** Token missing or invalid.

**Solutions:**
1. Check if token is saved:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
const token = await AsyncStorage.getItem('auth_token');
console.log('Token:', token);
```
2. Verify token is sent in Authorization header (check network tab)
3. Check if JWT_SECRET matches between backend .env and token generation
4. Re-login to get fresh token

---

### Issue 4: Supabase "Invalid API key"

**Cause:** Wrong Supabase URL or anon key.

**Solution:**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY` (for frontend)
3. Restart Expo server after updating .env

---

### Issue 5: "Employee not found" after creation

**Cause:** Manager used Supabase token, but employee endpoint expects employee token.

**Solution:**
1. Verify manager endpoints use manager JWT (from Supabase)
2. Verify employee endpoints use employee JWT (from POST /api/employee/login)
3. Check `req.user.user_id` in backend matches expected user type

---

### Issue 6: "Port 3000 already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

---

### Issue 7: Expo App Crashes on Startup

**Cause:** Syntax error or missing dependency.

**Solution:**
1. Check Expo console for error stack trace
2. Common issues:
   - Missing AsyncStorage: `npm install @react-native-async-storage/async-storage`
   - Missing Supabase: `npm install @supabase/supabase-js`
3. Clear cache and restart:
```bash
expo start -c  # Clear cache
```

---

## 7. Next Steps

### Immediate (Hackathon Demo):
- [x] Complete service migration (Phases 1-7)
- [x] Test all user flows (Manager + Employee)
- [x] Verify AI schedule generation works end-to-end
- [ ] **Test on physical device** (not just simulator)
- [ ] **Prepare demo script** (show key features)

### Post-Hackathon:
- [ ] Add error boundaries for better crash handling
- [ ] Implement loading states (spinners, skeletons)
- [ ] Add optimistic UI updates
- [ ] Implement offline support (cache data locally)
- [ ] Add push notifications for schedule approvals
- [ ] Deploy backend to Oracle Cloud
- [ ] Deploy frontend to Expo EAS

---

## Appendix A: cURL Testing Examples

### Test Manager Endpoints (Supabase)

**Note:** Manager auth uses Supabase directly, not custom endpoints. Use Supabase client in frontend.

---

### Test Employee Login
```bash
curl -X POST http://localhost:3000/api/employee/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test.employee",
    "password": "TempPass123!"
  }'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "employee": {
#       "id": "...",
#       "username": "test.employee",
#       "full_name": "Test Employee",
#       "first_login": true
#     }
#   }
# }
```

---

### Test Create Employee (Manager)
```bash
# Replace YOUR_MANAGER_TOKEN with actual token from Supabase login
curl -X POST http://localhost:3000/api/manager/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MANAGER_TOKEN" \
  -d '{
    "full_name": "John Doe",
    "username": "john.doe",
    "job_description": "Cashier, Server",
    "max_weekly_hours": 40
  }'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "employee": { "id": "...", "full_name": "John Doe", ... },
#     "temp_password": "Abc12345"
#   }
# }
```

---

### Test Get Employees (Manager)
```bash
curl -X GET http://localhost:3000/api/manager/employees \
  -H "Authorization: Bearer YOUR_MANAGER_TOKEN"

# Expected response:
# {
#   "success": true,
#   "data": [
#     { "id": "...", "full_name": "John Doe", "job_description": "Cashier, Server", ... },
#     ...
#   ]
# }
```

---

### Test Submit Shift Preferences (Employee)
```bash
# Replace YOUR_EMPLOYEE_TOKEN with actual token from employee login
curl -X POST http://localhost:3000/api/shifts/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_TOKEN" \
  -d '{
    "week_start": "2025-01-27",
    "slots": [
      { "day": "monday", "time": "08:00", "status": "available" },
      { "day": "monday", "time": "14:00", "status": "unavailable" },
      { "day": "tuesday", "time": "08:00", "status": "off_request" }
    ]
  }'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "id": "...",
#     "employee_id": "...",
#     "week_start": "2025-01-27",
#     "slots": [...],
#     "submitted_at": "2025-01-25T10:30:00Z"
#   }
# }
```

---

### Test Generate AI Schedule (Manager)
```bash
curl -X POST http://localhost:3000/api/schedules/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MANAGER_TOKEN" \
  -d '{
    "week_start": "2025-01-27"
  }'

# Expected response (takes 30-60 seconds):
# {
#   "success": true,
#   "data": {
#     "id": "...",
#     "week_start": "2025-01-27",
#     "status": "generated",
#     "shifts": [
#       { "employee_id": "...", "day": "monday", "start_time": "08:00", "end_time": "16:00" },
#       ...
#     ],
#     "summary": {
#       "total_shifts": 25,
#       "total_hours": 160,
#       "coverage_score": 0.92,
#       "warnings": []
#     },
#     "generated_at": "2025-01-25T10:35:00Z"
#   }
# }
```

---

## Appendix B: Environment Variables Quick Reference

### Backend (.env.local)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=256_bit_hex_string_here
RUNPOD_API_URL=https://your-pod-8888.proxy.runpod.net
RUNPOD_API_KEY=your_key
CORS_ORIGIN=http://localhost:3000,http://localhost:19000,exp://192.168.1.100:8081
```

### Frontend (.env)
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
# For physical device:
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000
```

---

## Appendix C: Migration Checklist

- [ ] **PHASE 1:** Create `services/api-client.ts`
- [ ] **PHASE 2:** Install Supabase client, update `services/auth.ts`
- [ ] **PHASE 3:** Update `services/employee-auth.ts`
- [ ] **PHASE 4:** Update `services/employee.ts` (add new fields)
- [ ] **PHASE 5:** Create `services/shift.ts`
- [ ] **PHASE 6:** Create `services/schedule.ts`
- [ ] **PHASE 7:** Verify `types/index.ts` has `max_weekly_hours`
- [ ] **TEST:** Manager registration → login → create employee (with new fields)
- [ ] **TEST:** Employee login → change password → submit preferences
- [ ] **TEST:** Manager generate schedule → approve → employee views shifts
- [ ] **TEST:** All error cases (invalid credentials, network errors, validation)
- [ ] **CLEANUP:** Remove all `USE_MOCK` flags, mock data, mock delays
- [ ] **VERIFY:** No console errors, all features working
- [ ] **DEVICE TEST:** Test on physical device (not just simulator)

---

**Last Updated:** October 25, 2025 11:00 UTC
**Status:** Ready for frontend migration
**Next Action:** Start with Phase 1 (API Client)

---

Good luck with the hackathon! 🚀
