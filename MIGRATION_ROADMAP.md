# 🗺️ Shiffy Frontend-Backend Integration Migration Roadmap

**Created:** October 25, 2025
**Purpose:** Phase-by-phase guide to migrate frontend from 100% mock data to real backend API integration
**Approach:** Incremental migration with testing after each phase
**Target:** Hackathon demo-ready application

---

## 📊 Migration Overview

### Current Architecture
```
Frontend (React Native + Expo)
    ↓ (MOCK DATA - USE_MOCK = true)
[No real connection]
    ↓
Backend (Express + TypeScript) ✅ 100% Complete
    ↓
Supabase (PostgreSQL + Auth)
```

### Target Architecture
```
Frontend (React Native + Expo)
    ↓ (REAL HTTP CALLS - fetch API)
Backend (Express + TypeScript)
    ↓
Supabase (PostgreSQL + Auth)
```

---

## 🎯 Migration Strategy

**Principle:** Replace mock implementations with real API calls **ONE SERVICE AT A TIME**

**Files to Modify:**
- ✏️ 3 existing service files (remove mocks)
- ➕ 3 new service files (create from scratch)
- ➕ 1 config file (Supabase client)
- ✔️ 1 types file (verify fields)

**Files to Keep Unchanged:**
- ✅ All UI components (Button, Input, Card, etc.)
- ✅ All screen files (auth, manager, employee screens)
- ✅ All utility files (validation, storage, helpers)
- ✅ All configuration files (package.json, app.json, etc.)

---

## 📋 Phase Checklist

- [ ] **Pre-Flight Checks** - Environment setup and backend verification
- [ ] **PHASE 1** - API Client Foundation
- [ ] **PHASE 2** - Manager Authentication (Supabase)
- [ ] **PHASE 3** - Employee Authentication (Custom JWT)
- [ ] **PHASE 4** - Employee CRUD Operations
- [ ] **PHASE 5** - Shift Preferences Service
- [ ] **PHASE 6** - AI Schedule Service
- [ ] **PHASE 7** - TypeScript Type Verification
- [ ] **Post-Migration** - Integration testing and cleanup

---

# 🚀 Pre-Flight Checks

**Objective:** Ensure backend is running and environment is properly configured before starting migration.

## ✅ Step 1: Start Backend Server

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/backend/`

**Commands:**
```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server running on port 3000
Supabase connected successfully
```

**Verification:**
```bash
curl http://localhost:3000/health
# Should return: {"status": "ok"}
```

**⚠️ If Backend Fails to Start:**
- Check if port 3000 is already in use: `lsof -ti:3000`
- Kill existing process: `kill -9 $(lsof -ti:3000)`
- Check `.env.local` file exists and has all required variables
- Check for error messages in console output

---

## ✅ Step 2: Verify Backend Environment Variables

**File:** `/Users/yamacbezirgan/Desktop/Shiffy/backend/.env.local`

**Required Variables:**
```bash
# Server
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Supabase (CRITICAL - Backend will fail without these)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT (CRITICAL - Employee auth will fail without this)
JWT_SECRET=<64-character hex string>
JWT_EXPIRY=7d

# RunPod Llama API (for AI scheduling)
RUNPOD_API_URL=https://your-pod-id-8888.proxy.runpod.net
RUNPOD_API_KEY=your_custom_api_key_here

# CORS (Allow frontend to connect)
CORS_ORIGIN=http://localhost:3000,http://localhost:19000,exp://192.168.1.100:8081

# Logging
LOG_LEVEL=debug
```

**How to Get Credentials:**
1. **Supabase URL & Service Key:**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Settings → API
   - Copy "Project URL" → `SUPABASE_URL`
   - Copy "service_role" secret key → `SUPABASE_SERVICE_KEY` ⚠️ NOT anon key!

2. **JWT Secret (if not set):**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **RunPod API (optional for now):**
   - Can be skipped for initial testing
   - Only needed for AI schedule generation

---

## ✅ Step 3: Create Frontend Environment File

**File:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/.env`

**Create this file with:**
```bash
# API Base URL (where backend is running)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# For testing on physical device, use your computer's local IP:
# Find IP: ifconfig | grep "inet " | grep -v 127.0.0.1
# Then update to: EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:3000
```

**Example for physical device:**
```bash
# If your computer's IP is 192.168.1.100:
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000
```

**⚠️ Important:**
- Expo requires `EXPO_PUBLIC_` prefix for environment variables
- Restart Expo server after creating/modifying `.env`
- For simulators, `localhost` works fine
- For physical devices, you MUST use your computer's local network IP

---

## ✅ Step 4: Install Required Dependencies

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/`

**Commands:**
```bash
cd frontend

# Install Supabase client (for manager authentication)
npm install @supabase/supabase-js

# Verify AsyncStorage is already installed (it should be)
npm list @react-native-async-storage/async-storage
```

**Expected Output:**
```
+ @supabase/supabase-js@2.x.x
```

**Dependencies Verification:**
- ✅ `@supabase/supabase-js` - NEW (for Phase 2)
- ✅ `@react-native-async-storage/async-storage` - EXISTING (already in package.json)

---

## ✅ Step 5: Test Backend Endpoints (Optional but Recommended)

**Quick Health Check:**
```bash
# Test manager employee endpoint (requires auth, should return 401)
curl http://localhost:3000/api/manager/employees

# Expected: {"success": false, "error": "Authorization header missing"}
# This means backend is running and auth middleware is working!
```

**Test Employee Login (if you have test data):**
```bash
curl -X POST http://localhost:3000/api/employee/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test.employee", "password": "TestPassword123"}'

# Expected: {"success": true, "data": {"token": "...", "employee": {...}}}
# OR: {"success": false, "error": "Invalid credentials"} if employee doesn't exist
```

---

# 📦 PHASE 1: API Client Foundation

**Objective:** Create a reusable HTTP client that handles authentication tokens automatically.

**Status:** 🆕 CREATE NEW FILE

**Why This Phase Exists:**
- Avoids code duplication (every service needs to make HTTP requests)
- Centralizes token management (Authorization header injection)
- Provides consistent error handling
- Makes debugging easier (single point of failure)

---

## 📄 Files to Create

### File: `frontend/services/api-client.ts`

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/services/api-client.ts`

**Purpose:** Shared HTTP client for all backend API calls

**Key Features:**
1. **Automatic Token Injection** - Reads token from AsyncStorage and adds to Authorization header
2. **Standardized Response Format** - All responses follow `{ success, data, error }` pattern
3. **Error Handling** - Catches network errors and returns user-friendly messages
4. **TypeScript Generic Support** - Type-safe responses with `apiClient<T>()`

---

## 🔧 Implementation Details

### Function: `apiClient<T>(endpoint, options)`

**Signature:**
```typescript
async function apiClient<T>(
  endpoint: string,      // e.g., '/api/manager/employees'
  options: RequestInit   // fetch options (method, body, headers, etc.)
): Promise<APIResponse<T>>
```

**Return Type:**
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Flow Diagram:**
```
1. Read token from AsyncStorage
2. Build headers (Content-Type + Authorization if token exists)
3. Make fetch request to API_BASE_URL + endpoint
4. Parse JSON response
5. Return { success, data, error }
6. If network error, catch and return { success: false, error: message }
```

**Example Usage:**
```typescript
// In employee.ts service
import { apiClient } from './api-client';

const response = await apiClient<Employee[]>('/api/manager/employees', {
  method: 'GET'
});

if (response.success) {
  console.log(response.data); // Employee[]
} else {
  console.error(response.error); // Error message
}
```

---

### Helper Functions

**1. `saveToken(token: string): Promise<void>`**
- Saves JWT token to AsyncStorage
- Key: `'auth_token'`
- Called after successful login

**2. `clearToken(): Promise<void>`**
- Removes JWT token from AsyncStorage
- Called on logout

**3. `getToken(): Promise<string | null>`**
- Retrieves current token
- Returns null if no token exists

---

## 📝 Full Implementation

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
 *
 * @param endpoint - API endpoint path (e.g., '/api/manager/employees')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise<APIResponse<T>> - Standardized response format
 *
 * @example
 * const response = await apiClient<Employee[]>('/api/manager/employees', {
 *   method: 'GET'
 * });
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
 * Save authentication token to AsyncStorage
 *
 * @param token - JWT token from login response
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
 * Get current authentication token
 *
 * @returns Token string or null if not logged in
 */
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('auth_token');
}
```

---

## ✅ Testing Phase 1

**After creating `api-client.ts`:**

1. **Verify file exists:**
   ```bash
   ls -la frontend/services/api-client.ts
   ```

2. **Check for TypeScript errors:**
   ```bash
   cd frontend
   npx tsc --noEmit
   ```

3. **Test import in another service:**
   ```typescript
   // In any service file, try:
   import { apiClient } from './api-client';
   // Should not show import errors
   ```

**Expected Outcome:**
- ✅ File created successfully
- ✅ No TypeScript compilation errors
- ✅ Can be imported by other services
- ✅ Ready for use in Phase 2-6

**⚠️ Common Issues:**
- **AsyncStorage import error** → Make sure `@react-native-async-storage/async-storage` is installed
- **Environment variable undefined** → Create `frontend/.env` with `EXPO_PUBLIC_API_BASE_URL`

---

# 🔐 PHASE 2: Manager Authentication (Supabase)

**Objective:** Replace mock manager authentication with real Supabase authentication.

**Status:** 🆕 CREATE CONFIG + ✏️ MODIFY SERVICE

**Why This Phase Exists:**
- Managers need secure authentication to access the system
- Supabase provides built-in auth (email/password, magic links, OAuth, etc.)
- Backend uses Supabase Auth for manager identity verification
- Manager JWT token is required for all manager API endpoints

---

## 📄 Files to Create/Modify

### 1. CREATE: `frontend/config/supabase.config.ts`

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/config/supabase.config.ts`

**Purpose:** Initialize Supabase client for frontend

**Required Credentials:**
- **SUPABASE_URL** - Your Supabase project URL
- **SUPABASE_ANON_KEY** - Public anonymous key (NOT service key!)

**Where to Find Credentials:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy "Project URL" → `SUPABASE_URL`
5. Copy "anon" "public" key → `SUPABASE_ANON_KEY`

**⚠️ CRITICAL:** Use **anon key** for frontend, NOT service key!

**Implementation:**
```typescript
import { createClient } from '@supabase/supabase-js';

// Get from Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

### 2. MODIFY: `frontend/services/auth.ts`

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/services/auth.ts`

**Current State:**
- Using `USE_MOCK = true` flag
- Hardcoded credentials: `yonetici@test.com / 123456`
- Returns mock Manager object
- Fake delays with `setTimeout`

**Target State:**
- No mock flag
- Real Supabase authentication
- Returns real Manager from database
- Real network requests

---

## 🔧 Implementation Details

### Current Mock Implementation (TO BE REMOVED):

```typescript
const USE_MOCK = true;

const MOCK_MANAGER = {
  id: 'mock-manager-123',
  email: 'yonetici@test.com',
  store_name: 'Test Mağaza',
  // ...
};

export async function loginManager(email: string, password: string) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay
    if (email === 'yonetici@test.com' && password === '123456') {
      return { manager: MOCK_MANAGER, token: 'mock-token-xyz' };
    }
    throw new Error('Hatalı e-posta veya şifre');
  }
  // Real implementation (currently unreachable)
}
```

---

### New Real Implementation:

**Function: `loginManager(email, password)`**

**Flow:**
1. Call `supabase.auth.signInWithPassword({ email, password })`
2. Receive `{ user, session }` from Supabase
3. Extract `session.access_token` (manager JWT)
4. Fetch manager profile from `managers` table using `user.id`
5. Save token to AsyncStorage via `saveToken()`
6. Return `{ manager, token }`

**Code:**
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
```

---

**Function: `registerManager(storeName, email, password)`**

**Flow:**
1. Call `supabase.auth.signUp({ email, password })`
2. Receive `{ user, session }` from Supabase
3. Insert new row into `managers` table with `user.id`
4. Save token to AsyncStorage
5. Return `{ manager, token }`

**Code:**
```typescript
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
```

---

**Function: `logoutManager()`**

**Flow:**
1. Call `supabase.auth.signOut()`
2. Call `clearToken()` to remove from AsyncStorage

**Code:**
```typescript
/**
 * Logout (clear session)
 */
export async function logoutManager(): Promise<void> {
  await supabase.auth.signOut();
  await clearToken();
}
```

---

## 📝 Complete auth.ts After Migration

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

  await saveToken(data.session.access_token);

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

---

## ✅ Testing Phase 2

**Prerequisites:**
- Backend running on localhost:3000
- Supabase credentials configured
- Frontend can access backend (no CORS errors)

**Test 1: Manager Registration**
1. Open app → "Yönetici Girişi" (Manager Login)
2. Click "Kayıt Ol" (Register)
3. Fill form:
   - Store name: "Test Mağaza"
   - Email: "test@example.com"
   - Password: "Password123!"
4. Submit
5. **Expected:** Redirects to manager dashboard
6. **Verify:** Check Supabase dashboard → Authentication → Users (should see new user)

**Test 2: Manager Login**
1. Logout
2. Login with registered email/password
3. **Expected:** Successful login, dashboard loads
4. **Verify:** Token saved (check AsyncStorage debug or re-open app without login prompt)

**Test 3: Invalid Credentials**
1. Try login with wrong password
2. **Expected:** Error message: "Invalid login credentials" (Supabase error)

**Test 4: Network Error**
1. Stop backend server
2. Try to login
3. **Expected:** Error about network failure

**⚠️ Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid API key" | Wrong Supabase URL or anon key | Verify credentials in supabase.config.ts |
| "Network request failed" | Backend not running or wrong URL | Check backend is running, verify EXPO_PUBLIC_API_BASE_URL |
| "Table 'managers' not found" | Database schema missing | Run backend migrations first |
| CORS error | Backend doesn't allow frontend origin | Add Expo URL to CORS_ORIGIN in backend .env.local |

---

# 👤 PHASE 3: Employee Authentication (Custom JWT)

**Objective:** Replace mock employee authentication with real backend API calls.

**Status:** ✏️ MODIFY EXISTING FILE

**Why This Phase Exists:**
- Employees use custom username/password auth (not Supabase)
- Backend issues custom JWT tokens for employees
- Employee tokens are required for employee-specific endpoints
- First-login password reset flow needs to work with real backend

---

## 📄 Files to Modify

### File: `frontend/services/employee-auth.ts`

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/services/employee-auth.ts`

**Current State:**
- Using `USE_MOCK = true` flag
- 6 hardcoded test employees with credentials
- Mock delays with `setTimeout`
- Mock `first_login` status simulation

**Target State:**
- No mock flag
- Real API calls to backend
- Real employee data from database
- Real password change functionality

---

## 🔧 Implementation Details

### Current Mock Implementation (TO BE REMOVED):

```typescript
const USE_MOCK = true;

const MOCK_CREDENTIALS = {
  'ahmet.ergun': { password: 'Password123!', first_login: false },
  'zeynep.yilmaz': { password: 'Shf9kL2pQx', first_login: true },
  // ... more mock employees
};

export async function employeeLogin(username: string, password: string) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockCred = MOCK_CREDENTIALS[username];
    if (mockCred && mockCred.password === password) {
      return { employee: {...}, token: 'mock-token-xyz' };
    }
    throw new Error('Kullanıcı adı veya şifre hatalı');
  }
}
```

---

### New Real Implementation:

**Backend Endpoints:**
- `POST /api/employee/login` - Employee login
- `POST /api/employee/change-password` - Password change (requires auth)

---

**Function: `employeeLogin(username, password)`**

**Flow:**
1. Call `apiClient` with `POST /api/employee/login`
2. Send `{ username, password }` in body
3. Receive `{ success, data: { token, employee } }`
4. Save token to AsyncStorage
5. Return employee data

**Request:**
```json
POST /api/employee/login
{
  "username": "ahmet.ergun",
  "password": "Password123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "employee": {
      "id": "uuid-here",
      "username": "ahmet.ergun",
      "full_name": "Ahmet Ergün",
      "first_login": false
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Code:**
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
```

---

**Function: `employeeChangePassword(oldPassword, newPassword)`**

**Flow:**
1. Call `apiClient` with `POST /api/employee/change-password`
2. Send `{ old_password, new_password }` in body
3. Token automatically added by `apiClient` (Authorization header)
4. Receive `{ success, data: { message } }`

**Request:**
```json
POST /api/employee/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "old_password": "TempPass123",
  "new_password": "MyNewPassword123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Code:**
```typescript
interface ChangePasswordResponse {
  message: string;
}

/**
 * Employee Change Password (Requires auth)
 */
export async function employeeChangePassword(
  oldPassword: string,
  newPassword: string
): Promise<string> {
  const response = await apiClient<ChangePasswordResponse>(
    '/api/employee/change-password',
    {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Password change failed');
  }

  return response.data.message;
}
```

---

**Function: `employeeLogout()`**

**Flow:**
1. Call `clearToken()` to remove token from AsyncStorage
2. No backend call needed (stateless JWT)

**Code:**
```typescript
/**
 * Employee Logout
 */
export async function employeeLogout(): Promise<void> {
  await clearToken();
}
```

---

## 📝 Complete employee-auth.ts After Migration

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
export async function employeeChangePassword(
  oldPassword: string,
  newPassword: string
): Promise<string> {
  const response = await apiClient<ChangePasswordResponse>(
    '/api/employee/change-password',
    {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    }
  );

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

---

## ✅ Testing Phase 3

**Prerequisites:**
- Backend running
- Manager logged in and created at least one employee
- Employee credentials available (username + temp password from creation)

**Test 1: Employee Login (First Time)**
1. Have manager create new employee:
   - Full name: "Test Employee"
   - Username: "test.employee"
   - Copy the temporary password shown (e.g., "ShfA1b2C3d4")
2. Logout from manager account
3. Go to "Çalışan Girişi" (Employee Login)
4. Login with username and temp password
5. **Expected:** Login succeeds, `first_login: true`
6. **Expected:** App prompts for password change

**Test 2: Password Change**
1. After first login, change password screen appears
2. Fill form:
   - Old password: (temp password)
   - New password: "MyNewPass123!"
   - Confirm password: "MyNewPass123!"
3. Submit
4. **Expected:** Password changed successfully
5. **Expected:** Redirects to employee dashboard

**Test 3: Login with New Password**
1. Logout
2. Login with username and new password
3. **Expected:** Login succeeds, `first_login: false`
4. **Expected:** Goes directly to dashboard (no password change prompt)

**Test 4: Invalid Credentials**
1. Try login with wrong username
2. **Expected:** Error: "Invalid credentials"
3. Try login with correct username but wrong password
4. **Expected:** Error: "Invalid credentials"

**Test 5: Token Persistence**
1. Login as employee
2. Close app completely
3. Reopen app
4. **Expected:** Still logged in (token persists in AsyncStorage)

**⚠️ Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid credentials" with correct password | Employee doesn't exist in backend DB | Use manager to create employee first |
| "Authorization header missing" on password change | Token not saved properly | Check `saveToken()` is called after login |
| "Old password incorrect" | Using wrong old password | Use the temp password from employee creation |
| Network error | Backend endpoint not working | Test backend endpoint with cURL first |

---

# 👥 PHASE 4: Employee CRUD Operations

**Objective:** Replace mock employee management with real backend API calls.

**Status:** ✏️ MODIFY EXISTING FILE

**Why This Phase Exists:**
- Managers need to create, read, update, and manage employees
- Real employee data must be stored in Supabase database
- **NEW FIELDS:** `job_description` and `max_weekly_hours` added to backend
- Employee operations require manager authentication

---

## 📄 Files to Modify

### File: `frontend/services/employee.ts`

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/services/employee.ts`

**Current State:**
- Using `USE_MOCK = true` flag
- Array of 6 mock employees with static data
- Client-side filtering for search
- Mutable mock array (changes persist in memory)

**Target State:**
- No mock flag
- Real API calls to backend manager endpoints
- Server-side data storage
- Support for new fields: `job_description`, `max_weekly_hours`

---

## 🔧 Implementation Details

### Backend Endpoints:

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/manager/employees` | List all employees | Manager JWT |
| POST | `/api/manager/employees` | Create employee | Manager JWT |
| GET | `/api/manager/employees/:id` | Get single employee | Manager JWT |
| PATCH | `/api/manager/employees/:id/notes` | Update notes | Manager JWT |
| PATCH | `/api/manager/employees/:id/status` | Toggle status | Manager JWT |

---

### Current Mock Implementation (TO BE REMOVED):

```typescript
const USE_MOCK = true;

let MOCK_EMPLOYEES = [
  {
    id: '1',
    manager_id: 'mock-manager-123',
    username: 'ahmet.ergun',
    full_name: 'Ahmet Ergün',
    job_description: 'Kasiyer, Barista',
    // ... more fields
  },
  // ... 5 more employees
];

export async function getEmployees(managerId: string): Promise<Employee[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_EMPLOYEES;
  }
}
```

---

### New Real Implementation:

**Function 1: `getEmployees()`**

**Flow:**
1. Call `apiClient` with `GET /api/manager/employees`
2. Manager token automatically injected by `apiClient`
3. Receive `{ success, data: Employee[] }`
4. Return employee array

**Backend Request:**
```
GET /api/manager/employees
Authorization: Bearer <manager_jwt>
```

**Backend Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "manager_id": "manager-uuid",
      "username": "ahmet.ergun",
      "full_name": "Ahmet Ergün",
      "job_description": "Kasiyer, Barista",
      "max_weekly_hours": 40,
      "first_login": false,
      "manager_notes": "Güvenilir çalışan",
      "status": "active",
      "created_at": "2025-01-20T10:00:00Z",
      "last_login": "2025-01-24T14:30:00Z"
    }
  ]
}
```

**Code:**
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
```

---

**Function 2: `searchEmployees(query)`**

**Flow:**
1. Fetch all employees via `getEmployees()`
2. Filter client-side by name, username, or job description
3. Return filtered array

**Note:** Backend doesn't have search endpoint, so we filter client-side.

**Code:**
```typescript
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
```

---

**Function 3: `getEmployee(employeeId)`**

**Flow:**
1. Call `apiClient` with `GET /api/manager/employees/:id`
2. Receive single employee object

**Backend Request:**
```
GET /api/manager/employees/uuid-123
Authorization: Bearer <manager_jwt>
```

**Code:**
```typescript
/**
 * Get Single Employee
 */
export async function getEmployee(employeeId: string): Promise<Employee> {
  const response = await apiClient<Employee>(
    `/api/manager/employees/${employeeId}`,
    {
      method: 'GET',
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch employee');
  }

  return response.data;
}
```

---

**Function 4: `createEmployee(fullName, username, jobDescription, maxWeeklyHours)` ⚠️ NEW SIGNATURE**

**⚠️ BREAKING CHANGE:** This function now accepts **4 parameters** instead of 3!

**Old Signature:**
```typescript
// OLD (3 parameters)
createEmployee(fullName, username, jobDescription)
```

**New Signature:**
```typescript
// NEW (4 parameters)
createEmployee(fullName, username, jobDescription, maxWeeklyHours)
```

**Flow:**
1. Call `apiClient` with `POST /api/manager/employees`
2. Send `{ full_name, username, job_description, max_weekly_hours }` in body
3. Receive `{ employee, temp_password }`
4. Return both employee and temporary password

**Backend Request:**
```json
POST /api/manager/employees
Authorization: Bearer <manager_jwt>
{
  "full_name": "John Doe",
  "username": "john.doe",
  "job_description": "Cashier, Server",
  "max_weekly_hours": 40
}
```

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "new-uuid",
      "full_name": "John Doe",
      "username": "john.doe",
      "job_description": "Cashier, Server",
      "max_weekly_hours": 40,
      "first_login": true,
      "status": "active"
    },
    "temp_password": "ShfA1b2C3d4"
  }
}
```

**Code:**
```typescript
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
```

**Validation Rules (Backend):**
- `full_name`: Required, max 100 chars
- `username`: Required, max 50 chars, unique, no spaces
- `job_description`: Optional, max 255 chars
- `max_weekly_hours`: Optional, integer 0-150 (0 = on leave, null = no limit)

---

**Function 5: `updateEmployeeNotes(employeeId, notes)`**

**Flow:**
1. Call `apiClient` with `PATCH /api/manager/employees/:id/notes`
2. Send `{ notes }` in body
3. Receive updated employee

**Backend Request:**
```json
PATCH /api/manager/employees/uuid-123/notes
Authorization: Bearer <manager_jwt>
{
  "notes": "Güvenilir çalışan, vardiyalara her zaman zamanında geliyor"
}
```

**Code:**
```typescript
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
```

---

**Function 6: `toggleEmployeeStatus(employeeId)`**

**Flow:**
1. Call `apiClient` with `PATCH /api/manager/employees/:id/status`
2. No body needed (backend toggles automatically)
3. Receive updated employee with new status

**Backend Request:**
```
PATCH /api/manager/employees/uuid-123/status
Authorization: Bearer <manager_jwt>
```

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "status": "inactive",  // Was "active", now "inactive"
    // ... other employee fields
  }
}
```

**Code:**
```typescript
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

---

## 📝 Complete employee.ts After Migration

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

---

## ⚠️ UI Changes Required

**File:** `frontend/app/(manager)/employees/add.tsx`

**Current form likely has 3 fields:**
- Full name
- Username
- Job description

**Need to add 4th field:**
- Max weekly hours (number input, 0-150)

**Example form state update:**
```typescript
const [form, setForm] = useState({
  fullName: '',
  username: '',
  jobDescription: '',
  maxWeeklyHours: null as number | null,  // NEW FIELD
});
```

**Example createEmployee call update:**
```typescript
// OLD (3 args)
const result = await createEmployee(
  form.fullName,
  form.username,
  form.jobDescription
);

// NEW (4 args)
const result = await createEmployee(
  form.fullName,
  form.username,
  form.jobDescription,
  form.maxWeeklyHours  // NEW
);
```

---

## ✅ Testing Phase 4

**Test 1: Get All Employees**
1. Login as manager
2. Go to "Çalışanlar" (Employees)
3. **Expected:** Employee list loads from backend
4. **Verify:** Real employees from database shown (not mock data)

**Test 2: Create Employee with New Fields**
1. Click "Yeni Çalışan Ekle" (Add Employee)
2. Fill form:
   - Full name: "Test Employee"
   - Username: "test.employee"
   - Job description: "Cashier, Barista"
   - Max weekly hours: 40
3. Submit
4. **Expected:** Employee created successfully
5. **Expected:** Temporary password displayed (copy it!)
6. **Verify:** New employee appears in list with all fields

**Test 3: Get Single Employee**
1. Click on any employee in list
2. **Expected:** Employee details page loads
3. **Verify:** All fields shown correctly (job_description, max_weekly_hours)

**Test 4: Update Employee Notes**
1. On employee details page, edit manager notes
2. Enter: "Güvenilir çalışan"
3. Save
4. **Expected:** Notes saved successfully
5. **Verify:** Notes persist after navigating away and back

**Test 5: Toggle Employee Status**
1. Click "Deaktif Et" (Deactivate) on active employee
2. **Expected:** Status changes to "inactive"
3. **Expected:** UI updates (e.g., grayed out, badge changes)
4. Click "Aktif Et" (Activate)
5. **Expected:** Status changes back to "active"

**Test 6: Search Employees**
1. Enter search query (e.g., employee name)
2. **Expected:** List filters to matching employees
3. **Verify:** Search works for name, username, and job description

**⚠️ Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Authorization header missing" | Manager not logged in | Login as manager first |
| "Username already exists" | Duplicate username | Use unique username |
| "Validation error: max_weekly_hours must be 0-150" | Invalid input | Check form validation |
| Empty employee list | No employees in database | Create employees via UI or backend |

---

# 📅 PHASE 5: Shift Preferences Service

**Objective:** Create new service for employee shift preference submission and retrieval.

**Status:** 🆕 CREATE NEW FILE

**Why This Phase Exists:**
- Employees need to submit weekly availability preferences
- Managers need to view all employee preferences before generating schedules
- Shift preferences are stored in `shift_preferences` table with JSONB slots
- This data feeds into the AI schedule generator

---

## 📄 Files to Create

### File: `frontend/services/shift.ts`

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/services/shift.ts`

**Purpose:** Handle shift preference operations (employee and manager views)

---

## 🔧 Implementation Details

### Backend Endpoints:

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/shifts/preferences` | Submit preferences | Employee JWT |
| GET | `/api/shifts/my-preferences?week_start=YYYY-MM-DD` | Get my preferences | Employee JWT |
| GET | `/api/shifts/requests?week_start=YYYY-MM-DD` | Get all preferences | Manager JWT |

---

### Data Structures:

**TimeSlot:**
```typescript
{
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
  time: 'HH:MM',  // e.g., '08:00', '14:30'
  status: 'available' | 'unavailable' | 'off_request' | null
}
```

**ShiftPreference:**
```typescript
{
  id: string;
  employee_id: string;
  week_start: string;  // 'YYYY-MM-DD' (Monday)
  slots: TimeSlot[];
  submitted_at: string;  // ISO timestamp
}
```

---

### Function 1: `submitPreferences(weekStart, slots)`

**Flow:**
1. Call `apiClient` with `POST /api/shifts/preferences`
2. Send `{ week_start, slots }` in body
3. Employee token automatically injected
4. Receive created/updated preference record

**Backend Request:**
```json
POST /api/shifts/preferences
Authorization: Bearer <employee_jwt>
{
  "week_start": "2025-01-27",
  "slots": [
    { "day": "monday", "time": "08:00", "status": "available" },
    { "day": "monday", "time": "14:00", "status": "unavailable" },
    { "day": "tuesday", "time": "08:00", "status": "off_request" }
  ]
}
```

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "id": "pref-uuid",
    "employee_id": "emp-uuid",
    "week_start": "2025-01-27",
    "slots": [...],
    "submitted_at": "2025-01-25T10:30:00Z"
  }
}
```

**Code:**
```typescript
import { apiClient } from './api-client';
import { ShiftPreference, TimeSlot } from '../types';

/**
 * Submit Shift Preferences (Employee)
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 * @param slots - Array of time slot preferences
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
```

---

### Function 2: `getMyPreferences(weekStart)`

**Flow:**
1. Call `apiClient` with `GET /api/shifts/my-preferences?week_start=YYYY-MM-DD`
2. Employee token automatically injected
3. Receive preference record or null if not submitted

**Backend Request:**
```
GET /api/shifts/my-preferences?week_start=2025-01-27
Authorization: Bearer <employee_jwt>
```

**Backend Response (Found):**
```json
{
  "success": true,
  "data": {
    "id": "pref-uuid",
    "employee_id": "emp-uuid",
    "week_start": "2025-01-27",
    "slots": [...],
    "submitted_at": "2025-01-25T10:30:00Z"
  }
}
```

**Backend Response (Not Found):**
```json
{
  "success": true,
  "data": null
}
```

**Code:**
```typescript
/**
 * Get My Preferences (Employee)
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 * @returns ShiftPreference or null if not submitted
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
```

---

### Function 3: `getShiftRequests(weekStart)`

**Flow:**
1. Call `apiClient` with `GET /api/shifts/requests?week_start=YYYY-MM-DD`
2. Manager token automatically injected
3. Receive array of all employee preferences for that week

**Backend Request:**
```
GET /api/shifts/requests?week_start=2025-01-27
Authorization: Bearer <manager_jwt>
```

**Backend Response:**
```json
{
  "success": true,
  "data": [
    {
      "employee_id": "emp-uuid-1",
      "full_name": "Ahmet Ergün",
      "slots": [...],
      "submitted_at": "2025-01-24T09:00:00Z"
    },
    {
      "employee_id": "emp-uuid-2",
      "full_name": "Zeynep Yılmaz",
      "slots": [...],
      "submitted_at": "2025-01-25T10:30:00Z"
    }
  ]
}
```

**Code:**
```typescript
interface EmployeePreferenceRequest {
  employee_id: string;
  full_name: string;
  slots: TimeSlot[];
  submitted_at: string;
}

/**
 * Get All Employee Preferences (Manager)
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 * @returns Array of all employee preferences for the week
 */
export async function getShiftRequests(
  weekStart: string
): Promise<EmployeePreferenceRequest[]> {
  const response = await apiClient<EmployeePreferenceRequest[]>(
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

---

## 📝 Complete shift.ts

```typescript
import { apiClient } from './api-client';
import { ShiftPreference, TimeSlot } from '../types';

interface EmployeePreferenceRequest {
  employee_id: string;
  full_name: string;
  slots: TimeSlot[];
  submitted_at: string;
}

/**
 * Submit Shift Preferences (Employee)
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 * @param slots - Array of time slot preferences
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
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 * @returns ShiftPreference or null if not submitted
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
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 * @returns Array of all employee preferences for the week
 */
export async function getShiftRequests(
  weekStart: string
): Promise<EmployeePreferenceRequest[]> {
  const response = await apiClient<EmployeePreferenceRequest[]>(
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

---

## 🔗 UI Integration Points

**Employee Preference Screen:** `frontend/app/(employee)/preferences.tsx`

**Current Implementation:**
- Uses local storage for preferences
- Grid state managed in component
- Auto-save to AsyncStorage

**Required Changes:**
1. Import `submitPreferences` and `getMyPreferences`
2. On component mount, call `getMyPreferences(currentWeekStart)`
3. Populate grid with returned slots (if exists)
4. On submit button, call `submitPreferences(weekStart, gridSlots)`
5. Show success message after submission

**Example:**
```typescript
// In preferences.tsx
import { submitPreferences, getMyPreferences } from '@/services/shift';

// Load existing preferences on mount
useEffect(() => {
  async function loadPreferences() {
    const prefs = await getMyPreferences(weekStart);
    if (prefs) {
      // Convert prefs.slots to grid format
      setGrid(convertSlotsToGrid(prefs.slots));
    }
  }
  loadPreferences();
}, [weekStart]);

// Submit preferences
async function handleSubmit() {
  const slots = convertGridToSlots(grid);
  await submitPreferences(weekStart, slots);
  Alert.alert('Başarılı', 'Tercihleriniz kaydedildi');
}
```

---

**Manager Shift Review Screen:** `frontend/app/(manager)/shift-review.tsx`

**Required Changes:**
1. Import `getShiftRequests`
2. Call `getShiftRequests(weekStart)` to load all employee preferences
3. Display employees with submission status
4. Show preference grids for each employee

---

## ✅ Testing Phase 5

**Test 1: Submit Preferences (Employee)**
1. Login as employee
2. Go to "Vardiya Tercihleri" (Shift Preferences)
3. Select week (e.g., next Monday)
4. Mark some slots:
   - Monday 08:00: Available
   - Tuesday 14:00: Unavailable
   - Wednesday 08:00: Off Request
5. Click "Gönder" (Submit)
6. **Expected:** Success message shown
7. **Verify:** Backend received data (check database or manager view)

**Test 2: Load Existing Preferences**
1. After submitting, refresh page
2. **Expected:** Grid populates with previously submitted preferences
3. **Verify:** All slot statuses match what was submitted

**Test 3: Update Preferences**
1. Change some slots
2. Submit again
3. **Expected:** Preferences updated (not duplicated)
4. **Verify:** Backend shows updated version

**Test 4: View Preferences (Manager)**
1. Login as manager
2. Have 2+ employees submit preferences for same week
3. Go to shift review/requests screen
4. **Expected:** See list of all employees who submitted preferences
5. **Expected:** Can view each employee's preference grid

**Test 5: No Preferences Yet**
1. Login as employee who never submitted for a week
2. Load preferences screen for that week
3. **Expected:** Empty grid (all null slots)
4. **Expected:** No errors

**⚠️ Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Authorization header missing" | Not logged in | Login as employee/manager first |
| "Invalid week_start format" | Wrong date format | Use YYYY-MM-DD format (Monday) |
| Empty slots array accepted | Frontend validation missing | Validate at least one slot has status |
| 401 error on manager endpoint | Using employee token | Login as manager for getShiftRequests |

---

# 🤖 PHASE 6: AI Schedule Service

**Objective:** Create new service for AI schedule generation, approval, and retrieval.

**Status:** 🆕 CREATE NEW FILE

**Why This Phase Exists:**
- Managers need to generate optimized schedules using AI (Llama 3.3 70B)
- Employees need to view their approved shift assignments
- Schedule workflow: pending → generated → approved
- AI uses employee preferences, job descriptions, and constraints to create schedules

---

## 📄 Files to Create

### File: `frontend/services/schedule.ts`

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/services/schedule.ts`

**Purpose:** Handle AI schedule generation and viewing (manager and employee perspectives)

---

## 🔧 Implementation Details

### Backend Endpoints:

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/schedules/generate` | Generate AI schedule | Manager JWT |
| POST | `/api/schedules/:id/approve` | Approve schedule | Manager JWT |
| GET | `/api/schedules?week_start=YYYY-MM-DD` | Get manager's schedule | Manager JWT |
| GET | `/api/schedules/my-schedule?week_start=YYYY-MM-DD` | Get employee's shifts | Employee JWT |

---

### Data Structures:

**AssignedShift:**
```typescript
{
  id: string;
  employee_id: string;
  employee_name: string;
  day: 'monday' | ... | 'sunday';
  start_time: string;  // 'HH:MM'
  end_time: string;    // 'HH:MM'
}
```

**ScheduleResponse:**
```typescript
{
  id: string;
  week_start: string;  // 'YYYY-MM-DD'
  status: 'pending' | 'generated' | 'approved';
  shifts: AssignedShift[];
  summary?: {
    total_shifts: number;
    total_hours: number;
    coverage_score: number;  // 0.0 - 1.0
    warnings: string[];
  };
  generated_at: string;
  approved_at: string | null;
}
```

**MyScheduleResponse:**
```typescript
{
  week_start: string;
  shifts: AssignedShift[];  // Only employee's own shifts
  status: 'pending' | 'generated' | 'approved';
}
```

---

### Function 1: `generateSchedule(weekStart)`

**Flow:**
1. Call `apiClient` with `POST /api/schedules/generate`
2. Send `{ week_start }` in body
3. Manager token automatically injected
4. **⚠️ WARNING:** This endpoint can take 30-60 seconds (AI processing time)
5. Receive generated schedule with shifts

**Backend Request:**
```json
POST /api/schedules/generate
Authorization: Bearer <manager_jwt>
{
  "week_start": "2025-01-27"
}
```

**Backend Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "schedule-uuid",
    "week_start": "2025-01-27",
    "status": "generated",
    "shifts": [
      {
        "id": "shift-uuid-1",
        "employee_id": "emp-uuid-1",
        "employee_name": "Ahmet Ergün",
        "day": "monday",
        "start_time": "08:00",
        "end_time": "16:00"
      },
      // ... more shifts
    ],
    "summary": {
      "total_shifts": 25,
      "total_hours": 160,
      "coverage_score": 0.92,
      "warnings": ["Low coverage on Sunday evening"]
    },
    "generated_at": "2025-01-25T10:35:00Z",
    "approved_at": null
  }
}
```

**Code:**
```typescript
import { apiClient } from './api-client';

interface AssignedShift {
  id: string;
  employee_id: string;
  employee_name: string;
  day: string;
  start_time: string;
  end_time: string;
}

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

/**
 * Generate AI Schedule (Manager Only)
 *
 * ⚠️ WARNING: This can take 30-60 seconds to complete
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
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
```

---

### Function 2: `approveSchedule(scheduleId)`

**Flow:**
1. Call `apiClient` with `POST /api/schedules/:id/approve`
2. No body needed
3. Receive updated schedule with `status: 'approved'` and `approved_at` timestamp

**Backend Request:**
```
POST /api/schedules/schedule-uuid/approve
Authorization: Bearer <manager_jwt>
```

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "id": "schedule-uuid",
    "status": "approved",
    "approved_at": "2025-01-25T11:00:00Z",
    // ... rest of schedule data
  }
}
```

**Code:**
```typescript
/**
 * Approve Schedule (Manager Only)
 *
 * @param scheduleId - ID of the generated schedule
 */
export async function approveSchedule(scheduleId: string): Promise<ScheduleResponse> {
  const response = await apiClient<ScheduleResponse>(
    `/api/schedules/${scheduleId}/approve`,
    {
      method: 'POST',
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to approve schedule');
  }

  return response.data;
}
```

---

### Function 3: `getManagerSchedule(weekStart)`

**Flow:**
1. Call `apiClient` with `GET /api/schedules?week_start=YYYY-MM-DD`
2. Receive schedule for that week (any status)
3. Returns null if no schedule exists

**Backend Request:**
```
GET /api/schedules?week_start=2025-01-27
Authorization: Bearer <manager_jwt>
```

**Backend Response (Found):**
```json
{
  "success": true,
  "data": {
    // Full schedule data (all employees, any status)
  }
}
```

**Backend Response (Not Found):**
```json
{
  "success": true,
  "data": null
}
```

**Code:**
```typescript
/**
 * Get Manager's Schedule (All employees, any status)
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 */
export async function getManagerSchedule(
  weekStart: string
): Promise<ScheduleResponse | null> {
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
```

---

### Function 4: `getMySchedule(weekStart)`

**Flow:**
1. Call `apiClient` with `GET /api/schedules/my-schedule?week_start=YYYY-MM-DD`
2. Employee token automatically injected
3. Receive only **approved** schedules with only **employee's own shifts**
4. Returns null if no approved schedule exists

**Backend Request:**
```
GET /api/schedules/my-schedule?week_start=2025-01-27
Authorization: Bearer <employee_jwt>
```

**Backend Response (Approved Schedule Found):**
```json
{
  "success": true,
  "data": {
    "week_start": "2025-01-27",
    "status": "approved",
    "shifts": [
      {
        "id": "shift-uuid-1",
        "employee_id": "my-emp-uuid",
        "employee_name": "Ahmet Ergün",
        "day": "monday",
        "start_time": "08:00",
        "end_time": "16:00"
      },
      {
        "id": "shift-uuid-2",
        "employee_id": "my-emp-uuid",
        "employee_name": "Ahmet Ergün",
        "day": "wednesday",
        "start_time": "14:00",
        "end_time": "22:00"
      }
      // Only this employee's shifts
    ]
  }
}
```

**Backend Response (No Approved Schedule):**
```json
{
  "success": true,
  "data": null
}
```

**Code:**
```typescript
interface MyScheduleResponse {
  week_start: string;
  shifts: AssignedShift[];
  status: 'pending' | 'generated' | 'approved';
}

/**
 * Get Employee's Schedule (Only approved, only their shifts)
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 */
export async function getMySchedule(
  weekStart: string
): Promise<MyScheduleResponse | null> {
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

---

## 📝 Complete schedule.ts

```typescript
import { apiClient } from './api-client';

interface AssignedShift {
  id: string;
  employee_id: string;
  employee_name: string;
  day: string;
  start_time: string;
  end_time: string;
}

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
 *
 * ⚠️ WARNING: This can take 30-60 seconds to complete
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
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
 *
 * @param scheduleId - ID of the generated schedule
 */
export async function approveSchedule(scheduleId: string): Promise<ScheduleResponse> {
  const response = await apiClient<ScheduleResponse>(
    `/api/schedules/${scheduleId}/approve`,
    {
      method: 'POST',
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to approve schedule');
  }

  return response.data;
}

/**
 * Get Manager's Schedule (All employees, any status)
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 */
export async function getManagerSchedule(
  weekStart: string
): Promise<ScheduleResponse | null> {
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
 *
 * @param weekStart - Monday of the week (YYYY-MM-DD format)
 */
export async function getMySchedule(
  weekStart: string
): Promise<MyScheduleResponse | null> {
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

---

## 🔗 UI Integration Points

**Manager Schedule Screen:** `frontend/app/(manager)/shift-review.tsx` (or create new schedule screen)

**Required Features:**
1. Week selector
2. "Generate Schedule" button → calls `generateSchedule()`
3. Loading indicator (30-60 seconds)
4. Display generated shifts in calendar/grid view
5. Show summary stats (total shifts, hours, coverage score)
6. Show warnings if any
7. "Approve" button → calls `approveSchedule(scheduleId)`

**Example:**
```typescript
// In manager schedule screen
import { generateSchedule, approveSchedule, getManagerSchedule } from '@/services/schedule';

async function handleGenerate() {
  setLoading(true);
  try {
    const schedule = await generateSchedule(weekStart);
    setSchedule(schedule);
    Alert.alert('Başarılı', 'Vardiya planı oluşturuldu');
  } catch (error) {
    Alert.alert('Hata', error.message);
  } finally {
    setLoading(false);
  }
}

async function handleApprove() {
  await approveSchedule(schedule.id);
  Alert.alert('Başarılı', 'Vardiya planı onaylandı');
}
```

---

**Employee Shift Screen:** `frontend/app/(employee)/my-shifts.tsx`

**Required Features:**
1. Week selector
2. Load schedule with `getMySchedule(weekStart)`
3. Display only approved shifts
4. Show "No shifts yet" if null
5. Calendar/list view of assigned shifts

**Example:**
```typescript
// In employee shifts screen
import { getMySchedule } from '@/services/schedule';

useEffect(() => {
  async function loadSchedule() {
    const schedule = await getMySchedule(weekStart);
    if (schedule) {
      setShifts(schedule.shifts);
    } else {
      setShifts([]);
    }
  }
  loadSchedule();
}, [weekStart]);
```

---

## ✅ Testing Phase 6

**Prerequisites:**
- Backend has RunPod API configured (or AI mock enabled)
- Manager has created employees
- Employees have submitted shift preferences

**Test 1: Generate Schedule (Manager)**
1. Login as manager
2. Ensure at least 2 employees have submitted preferences for a week
3. Go to schedule/planning screen
4. Select week
5. Click "Generate Schedule"
6. **Expected:** Loading indicator shows for 30-60 seconds
7. **Expected:** Schedule appears with shifts assigned
8. **Expected:** Summary shows total shifts, hours, coverage score
9. **Verify:** Status is "generated" (not yet approved)

**Test 2: Approve Schedule**
1. After generating schedule
2. Click "Approve" button
3. **Expected:** Status changes to "approved"
4. **Expected:** Approved timestamp is set
5. **Verify:** Employees can now see their shifts

**Test 3: View Schedule (Employee)**
1. Login as employee
2. Go to "Vardiyalarım" (My Shifts)
3. Select week (must be approved week)
4. **Expected:** See only this employee's shifts
5. **Expected:** Cannot see other employees' shifts
6. **Expected:** Only approved schedules visible

**Test 4: No Schedule Yet**
1. Employee views week with no approved schedule
2. **Expected:** Show "Henüz vardiya atanmadı" (No shifts assigned yet)
3. **Expected:** No errors

**Test 5: Regenerate Schedule**
1. Manager generates schedule for week
2. Review shifts
3. Don't approve, generate again
4. **Expected:** Old schedule replaced with new one
5. **Verify:** Schedule ID changes

**⚠️ Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "No employee preferences found" | Employees didn't submit preferences | Have employees submit preferences first |
| Timeout error | AI taking too long | Increase timeout or check RunPod API status |
| Empty shifts array | AI generation failed | Check backend logs for AI errors |
| 401 error | Wrong auth | Manager for generate/approve, employee for my-schedule |
| Old schedule visible | Not refreshing | Call getManagerSchedule after approve |

---

# 📋 PHASE 7: TypeScript Type Verification

**Objective:** Verify all TypeScript types match the backend schema, especially new fields.

**Status:** ✔️ VERIFY EXISTING FILE

**Why This Phase Exists:**
- Backend recently added `job_description` and `max_weekly_hours` to employees
- TypeScript types must match backend to prevent runtime errors
- Type safety ensures frontend sends correct data structure

---

## 📄 Files to Verify

### File: `frontend/types/index.ts`

**Location:** `/Users/yamacbezirgan/Desktop/Shiffy/frontend/types/index.ts`

---

## 🔧 Verification Checklist

### 1. Employee Interface

**Required Fields (from backend schema):**
```typescript
export interface Employee {
  id: string;
  manager_id: string;
  username: string;
  full_name: string;
  job_description: string | null;  // ✅ Should exist (VARCHAR 255, nullable)
  max_weekly_hours: number | null; // ⚠️ VERIFY THIS EXISTS (INTEGER 0-150, nullable)
  first_login: boolean;
  manager_notes: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  last_login: string | null;
}
```

**What to Check:**
- ✅ `job_description: string | null` exists (should already be there)
- ⚠️ `max_weekly_hours: number | null` exists (might be missing - ADD IF NEEDED)

---

### 2. Manager Interface

**Required Fields:**
```typescript
export interface Manager {
  id: string;
  email: string;
  store_name: string;
  created_at: string;
  subscription_status: 'trial' | 'active' | 'expired';
  subscription_tier: 'basic' | 'premium';
}
```

**What to Check:**
- ✅ All fields match Supabase managers table schema

---

### 3. Shift Preference Types

**Required Types:**
```typescript
export type SlotStatus = 'available' | 'unavailable' | 'off_request' | null;

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface TimeSlot {
  day: DayOfWeek;
  time: string;  // 'HH:MM' format
  status: SlotStatus;
}

export interface ShiftPreference {
  id: string;
  employee_id: string;
  week_start: string;  // 'YYYY-MM-DD' Monday
  slots: TimeSlot[];
  submitted_at: string;
}
```

**What to Check:**
- ✅ SlotStatus includes all 4 states
- ✅ DayOfWeek is lowercase (matches backend)
- ✅ TimeSlot structure matches

---

### 4. Schedule Types

**Required Types:**
```typescript
export interface AssignedShift {
  id: string;
  employee_id: string;
  employee_name: string;
  day: DayOfWeek;
  start_time: string;  // 'HH:MM'
  end_time: string;    // 'HH:MM'
}

export interface WeekSchedule {
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
```

**What to Check:**
- ✅ AssignedShift has employee_name (needed for UI)
- ✅ Status enum matches backend
- ✅ Summary is optional (might not exist for all schedules)

---

## 📝 Action Items

**If `max_weekly_hours` is MISSING from Employee interface:**

```typescript
// ADD THIS FIELD
export interface Employee {
  // ... existing fields
  max_weekly_hours: number | null;  // 0-150, nullable (0 = on leave, null = no limit)
}
```

**If any schedule types are missing:**

Create them in `types/index.ts` as shown above.

---

## ✅ Testing Phase 7

**After updating types:**

1. **Run TypeScript compiler:**
   ```bash
   cd frontend
   npx tsc --noEmit
   ```
   **Expected:** No type errors

2. **Check service files:**
   ```bash
   # Should show no import errors or type mismatches
   grep -r "Employee" services/*.ts
   ```

3. **Verify IDE autocomplete:**
   - Open `services/employee.ts`
   - Type `employee.` and check autocomplete
   - Should see `max_weekly_hours` in suggestions

4. **Test createEmployee call:**
   ```typescript
   // In add employee screen
   const result = await createEmployee(
     form.fullName,
     form.username,
     form.jobDescription,
     form.maxWeeklyHours  // Should have autocomplete and type checking
   );
   ```

**⚠️ Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Type error: Property 'max_weekly_hours' does not exist | Missing field in interface | Add `max_weekly_hours: number \| null` to Employee |
| Type error: Argument of type 'number' is not assignable | Strict null checking | Use `number \| null` not just `number` |
| Import error for types | Wrong import path | Use `import { Employee } from '../types'` or `@/types` |

---

# ✅ Post-Migration: Integration Testing & Cleanup

**Objective:** End-to-end testing and removal of all mock code.

---

## 🧹 Cleanup Checklist

**1. Remove Mock Flags:**
- [ ] `frontend/services/auth.ts` - Delete `USE_MOCK` constant
- [ ] `frontend/services/employee-auth.ts` - Delete `USE_MOCK` constant
- [ ] `frontend/services/employee.ts` - Delete `USE_MOCK` constant

**2. Remove Mock Data:**
- [ ] Delete `MOCK_MANAGER` object from auth.ts
- [ ] Delete `MOCK_CREDENTIALS` object from employee-auth.ts
- [ ] Delete `MOCK_EMPLOYEES` array from employee.ts

**3. Remove Mock Delays:**
- [ ] Delete all `setTimeout` calls used for fake delays

**4. Verify Imports:**
- [ ] All service files import from `./api-client`
- [ ] auth.ts imports from `../config/supabase.config`
- [ ] All services properly typed with TypeScript

---

## 🧪 End-to-End Test Flow

**Complete User Journey:**

1. **Manager Registration & Login:**
   - [ ] Register new manager
   - [ ] Logout
   - [ ] Login with same credentials
   - [ ] Verify dashboard loads

2. **Employee Management:**
   - [ ] Create employee with all fields (including max_weekly_hours)
   - [ ] Copy temporary password
   - [ ] View employee list
   - [ ] Search for employee
   - [ ] Edit employee notes
   - [ ] Toggle employee status

3. **Employee First Login:**
   - [ ] Logout from manager
   - [ ] Login as employee with temp password
   - [ ] Verify password change prompt
   - [ ] Change password
   - [ ] Verify redirect to dashboard

4. **Shift Preferences:**
   - [ ] Employee submits preferences for next week
   - [ ] Logout and login again
   - [ ] Verify preferences persist
   - [ ] Manager views all employee preferences

5. **Schedule Generation:**
   - [ ] Manager generates AI schedule
   - [ ] Review shifts
   - [ ] Approve schedule
   - [ ] Employee views approved shifts

6. **Error Handling:**
   - [ ] Stop backend, verify network error shown
   - [ ] Try invalid credentials, verify error message
   - [ ] Try duplicate username, verify validation error

---

## 📊 Success Criteria

- ✅ All mock flags removed
- ✅ All mock data removed
- ✅ All screens work with real backend
- ✅ No TypeScript errors
- ✅ No console errors in Expo
- ✅ Authentication persists across app restarts
- ✅ All CRUD operations work
- ✅ AI schedule generation works (or shows appropriate error)
- ✅ Error messages are user-friendly

---

## 🚨 Rollback Plan (If Needed)

**If migration fails and you need to revert:**

1. **Git revert:**
   ```bash
   git checkout HEAD -- frontend/services/
   ```

2. **Or manually restore mock flags:**
   ```typescript
   const USE_MOCK = true;  // Set back to true
   ```

**⚠️ IMPORTANT:** Commit working code after each phase to enable easy rollback!

---

# 📚 Appendix: Quick Reference

## Environment Variables

**Backend (.env.local):**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
JWT_SECRET=64_char_hex_string
RUNPOD_API_URL=https://xxx.proxy.runpod.net
CORS_ORIGIN=http://localhost:3000,http://localhost:19000
```

**Frontend (.env):**
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## Common Commands

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm start
```

**Test Backend:**
```bash
curl http://localhost:3000/health
```

**TypeScript Check:**
```bash
cd frontend
npx tsc --noEmit
```

---

## API Endpoint Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/employee/login` | POST | None | Employee login |
| `/api/employee/change-password` | POST | Employee | Change password |
| `/api/manager/employees` | GET | Manager | List employees |
| `/api/manager/employees` | POST | Manager | Create employee |
| `/api/manager/employees/:id` | GET | Manager | Get employee |
| `/api/manager/employees/:id/notes` | PATCH | Manager | Update notes |
| `/api/manager/employees/:id/status` | PATCH | Manager | Toggle status |
| `/api/shifts/preferences` | POST | Employee | Submit preferences |
| `/api/shifts/my-preferences` | GET | Employee | Get my preferences |
| `/api/shifts/requests` | GET | Manager | Get all preferences |
| `/api/schedules/generate` | POST | Manager | Generate schedule |
| `/api/schedules/:id/approve` | POST | Manager | Approve schedule |
| `/api/schedules` | GET | Manager | Get manager schedule |
| `/api/schedules/my-schedule` | GET | Employee | Get employee schedule |

---

## File Change Summary

| File | Status | Description |
|------|--------|-------------|
| `services/api-client.ts` | 🆕 CREATE | HTTP client with token management |
| `config/supabase.config.ts` | 🆕 CREATE | Supabase client initialization |
| `services/auth.ts` | ✏️ MODIFY | Remove mock, add Supabase |
| `services/employee-auth.ts` | ✏️ MODIFY | Remove mock, add API calls |
| `services/employee.ts` | ✏️ MODIFY | Remove mock, add API calls, add max_weekly_hours |
| `services/shift.ts` | 🆕 CREATE | Shift preference operations |
| `services/schedule.ts` | 🆕 CREATE | Schedule generation & viewing |
| `types/index.ts` | ✔️ VERIFY | Check max_weekly_hours exists |
| `app/(manager)/employees/add.tsx` | ⚠️ UPDATE | Add max_weekly_hours input field |

---

## Troubleshooting Quick Links

- **CORS Error:** Check backend `CORS_ORIGIN` includes Expo URL
- **Network Error:** Verify backend is running, check URL in .env
- **401 Unauthorized:** Check token is saved, verify correct auth for endpoint
- **Supabase Error:** Verify SUPABASE_URL and SUPABASE_ANON_KEY
- **Type Errors:** Run `npx tsc --noEmit` to see details

---

**Good luck with the migration! 🚀**

**Last Updated:** October 25, 2025
**Status:** Ready for phase-by-phase execution
**Next Step:** Execute Pre-Flight Checks
