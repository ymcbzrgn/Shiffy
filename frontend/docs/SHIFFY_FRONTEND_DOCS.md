# Shiffy - Frontend Technical Documentation
**Team:** Golden Head  
**Hackathon:** Meta & YTU Llama Hackathon 2025  
**Theme:** Productivity Tools  
**Tech Stack:** Expo SDK 54 + TypeScript + Supabase

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Authentication System](#authentication-system)
5. [Screen Specifications](#screen-specifications)
6. [Data Models & API Contract](#data-models--api-contract)
7. [State Management Strategy](#state-management-strategy)
8. [Testing Guidelines](#testing-guidelines)
9. [Development Workflow](#development-workflow)

---

## System Overview

### Problem Statement
Part-time çalışanların shift taleplerinin manuel ve uzun sürmesi, yöneticilerin adil dağılım yapamaması.

### Solution Architecture
Mobile-first B2B2C platform:
- **B2B**: Yöneticiler register olup mağazalarını yönetir
- **B2C**: Çalışanlar yönetici tarafından eklenir, shift tercihlerini bildirir

### MVP Scope
**Manager Features:**
- Self-registration (email/password via Supabase)
- Employee management (CRUD operations)
- Employee notes (AI input for shift generation)
- Shift request review
- AI-generated schedule approval/editing
- Deadline configuration

**Employee Features:**
- Manager-assigned login (username/password via backend)
- Mandatory password change on first login
- 30-minute slot-based shift preference selection
- Approved schedule viewing

**AI Integration (Backend):**
- Llama API for shift optimization
- Input: Employee preferences + Manager notes
- Output: Optimized shift assignments (JSON)

### Non-MVP (Future)
- Chat-based shift requests
- Push notifications (shift approved, reminder)
- Shift swapping between employees
- Analytics dashboard
- Multi-store support

---

## Architecture

### Technology Stack

**Core Framework:**
- Expo SDK 54 (managed workflow, not bare)
- React Native 0.76
- TypeScript (strict mode, no `any`)
- Expo Router (file-based routing)

**Backend Integration:**
- Supabase (Manager auth + PostgreSQL)
- Custom Node.js backend (Employee auth, shift logic)
- RunPod-hosted Llama API

**State & Storage:**
- React hooks (no Redux/Zustand for MVP)
- Expo SecureStore (encrypted token storage)
- Local state caching (shift preferences draft)

**Testing:**
- Jest + React Native Testing Library
- Unit tests for components/utils
- Integration tests for critical flows

### Design Principles
**KISS (Keep It Simple, Stupid):**
- No unnecessary abstractions
- Direct API calls, no complex state management
- Flat component structure (max 2 levels deep)

**CLEAN CODE:**
- Self-documenting code (minimal comments)
- Single Responsibility Principle
- Max 300 lines per file, 50 lines per function
- Descriptive naming (no abbreviations)

**Mobile-First:**
- Touch-optimized UI (min 44x44pt tap targets)
- Gesture support (swipe to delete, long press to select)
- Loading states for all async operations
- Offline-ready (draft saving for shift preferences)

### Git Merge Strategy
**Problem:** Frontend + Backend in same repo, hackathon time pressure

**Solution:**
- `frontend/` and `backend/` completely independent
- No shared files (even types are duplicated)
- API contract defined in `docs/API.md` (single source of truth)
- Breaking changes communicated via Discord + PR labels

**Branching:**
```
main (protected)
├── develop (integration)
├── feature/auth-screens
├── feature/shift-grid
└── feature/manager-dashboard
```

---

## Project Structure

```
shiffy/
├── docs/                           # Root-level documentation
│   ├── API.md                     # Backend API contract
│   ├── DATABASE_SCHEMA.md         # Supabase tables
│   └── DEPLOYMENT.md              # Build & deploy guide
│
├── frontend/
│   ├── docs/                      # Frontend-specific docs
│   │   ├── COMPONENTS.md          # Component usage guide
│   │   ├── SCREENS.md             # Screen flows & wireframes
│   │   ├── TESTING.md             # Test strategy
│   │   └── SETUP.md               # Local dev setup
│   │
│   ├── test/                      # Tests mirror src/ structure
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── shift/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   ├── manager/
│   │   │   └── employee/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   ├── src/
│   │   ├── app/                   # Expo Router screens
│   │   │   ├── (auth)/           # Public routes (no auth)
│   │   │   │   ├── landing.tsx
│   │   │   │   ├── manager-login.tsx
│   │   │   │   ├── manager-register.tsx
│   │   │   │   ├── employee-login.tsx
│   │   │   │   └── change-password.tsx
│   │   │   │
│   │   │   ├── (manager)/        # Protected manager routes
│   │   │   │   ├── _layout.tsx   # Tab navigator
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── employees.tsx
│   │   │   │   ├── add-employee.tsx
│   │   │   │   ├── employee-detail/[id].tsx
│   │   │   │   ├── shift-review.tsx
│   │   │   │   └── settings.tsx
│   │   │   │
│   │   │   ├── (employee)/       # Protected employee routes
│   │   │   │   ├── _layout.tsx   # Tab navigator
│   │   │   │   ├── home.tsx
│   │   │   │   ├── shift-preferences.tsx
│   │   │   │   ├── my-shifts.tsx
│   │   │   │   └── profile.tsx
│   │   │   │
│   │   │   └── _layout.tsx       # Root layout (auth guard)
│   │   │
│   │   ├── components/
│   │   │   ├── ui/               # Base components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   │
│   │   │   ├── shift/            # Shift-specific components
│   │   │   │   ├── ShiftGrid.tsx        # Main interactive grid
│   │   │   │   ├── TimeSlot.tsx         # Individual slot
│   │   │   │   ├── WeekCalendar.tsx     # Week selector
│   │   │   │   └── ShiftLegend.tsx      # Color guide
│   │   │   │
│   │   │   └── layout/           # Layout helpers
│   │   │       ├── Header.tsx
│   │   │       └── TabBar.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts            # Backend HTTP client
│   │   │   ├── supabase.ts       # Supabase client config
│   │   │   └── auth.ts           # Auth service layer
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts        # Auth state & actions
│   │   │   ├── useShifts.ts      # Shift data fetching
│   │   │   └── useEmployees.ts   # Employee CRUD
│   │   │
│   │   ├── types/
│   │   │   ├── auth.ts           # User, Session types
│   │   │   ├── shift.ts          # Shift, TimeSlot types
│   │   │   └── api.ts            # API request/response types
│   │   │
│   │   ├── utils/
│   │   │   ├── dateHelpers.ts    # Date formatting, week calc
│   │   │   ├── validators.ts     # Form validation
│   │   │   └── constants.ts      # App-wide constants
│   │   │
│   │   └── styles/
│   │       └── theme.ts          # Colors, spacing, typography
│   │
│   ├── assets/                   # Images, fonts
│   ├── .env.example
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── backend/
    └── (separate structure)
```

---

## Authentication System

### Dual Authentication Architecture
**Why Two Systems?**
- Managers need self-service registration
- Employees are provisioned by managers (no self-registration)
- Different permission scopes
- B2B2C business model

### Manager Auth Flow (Supabase)
**Technology:** Supabase Auth (PostgreSQL + JWT)

**Registration:**
1. User enters email + password + store name
2. `supabase.auth.signUp()` creates Supabase user
3. Insert into `managers` table (user_id, email, store_name)
4. Auto-login with session token
5. Redirect to dashboard

**Login:**
1. User enters email + password
2. `supabase.auth.signInWithPassword()`
3. Receive session token
4. Store in Expo SecureStore
5. Redirect to dashboard

**Token Management:**
- Access token: 1 hour expiry
- Refresh token: 30 days expiry
- Auto-refresh handled by Supabase client

### Employee Auth Flow (Custom Backend)
**Technology:** Node.js + JWT (separate from Supabase)

**Provisioning (by Manager):**
1. Manager enters employee name + username
2. Backend generates temporary password (8 chars, alphanumeric)
3. Insert into `employees` table (manager_id, username, hashed_password, first_login=true)
4. Manager copies credentials to share with employee

**First Login:**
1. Employee enters username + password
2. POST `/auth/employee/login`
3. Backend validates, returns: `{ access_token, user_id, first_login: true }`
4. Frontend redirects to change-password screen
5. Employee sets new password
6. Backend updates first_login=false
7. Redirect to home

**Subsequent Logins:**
1. Same POST `/auth/employee/login`
2. `first_login: false` → redirect to home directly

**Token Management:**
- JWT with 7-day expiry (longer than manager for convenience)
- No refresh token (re-login required after 7 days)
- Manual refresh on 401 errors

### Session Storage
**Keys in SecureStore:**
```typescript
{
  'shiffy_user_type': 'manager' | 'employee',
  'shiffy_access_token': string,
  'shiffy_refresh_token'?: string,  // Only managers
  'shiffy_user_id': string,
  'shiffy_store_id'?: string,       // Only managers
  'shiffy_first_login'?: 'true'     // Employees only
}
```

### Route Protection
**Implementation:** Root `_layout.tsx`
- Check SecureStore on app load
- If no token → redirect to landing
- If token exists:
  - Validate with backend (health check)
  - Route based on user_type:
    - `manager` → `/(manager)/dashboard`
    - `employee` → `/(employee)/home`

---

## Screen Specifications

### Navigation Structure
```
Landing (public)
  ├─→ Manager Login (public)
  │     ├─→ Register (public)
  │     └─→ Dashboard (protected)
  │           ├─→ Employees
  │           │     └─→ Add Employee
  │           │     └─→ Employee Detail
  │           ├─→ Shift Review
  │           └─→ Settings
  │
  └─→ Employee Login (public)
        ├─→ Change Password (first login only)
        └─→ Home (protected)
              ├─→ Shift Preferences
              ├─→ My Shifts
              └─→ Profile
```

---

### Auth Screens

#### 1. Landing (`landing.tsx`)
**Purpose:** User type selection

**Layout:**
- Logo (centered, 120x120)
- Tagline: "Smart Shift Management"
- Two large buttons (full-width, 60px height):
  - "Yönetici Girişi" (primary color)
  - "Çalışan Girişi" (secondary color)

**Navigation:**
- Manager button → `/(auth)/manager-login`
- Employee button → `/(auth)/employee-login`

**State:** None (stateless)

---

#### 2. Manager Login (`manager-login.tsx`)
**Inputs:**
- Email (type: email, autocomplete: email, autocapitalize: none)
- Password (type: password, secure entry)

**Validation:**
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password: min 6 characters

**Actions:**
- "Giriş Yap" → `authService.loginManager()`
- "Hesap Oluştur" link → navigate to register

**Error Messages:**
- Invalid credentials: "Email veya şifre hatalı"
- Network error: "Bağlantı hatası, lütfen tekrar deneyin"
- Generic: "Bir hata oluştu"

**Loading State:** Disable inputs, show spinner on button

---

#### 3. Manager Register (`manager-register.tsx`)
**Inputs:**
- Email
- Password
- Confirm Password
- Store Name (text input)

**Validation:**
- Email format
- Passwords match
- Password min 6 chars
- Store name min 3 chars

**Flow:**
1. Validate inputs
2. `authService.registerManager(email, password, storeName)`
3. Auto-login (Supabase handles this)
4. Navigate to dashboard

**Error Handling:**
- Email already exists: "Bu email kullanımda"
- Weak password: "Şifre en az 6 karakter olmalı"

---

#### 4. Employee Login (`employee-login.tsx`)
**Inputs:**
- Username (assigned by manager)
- Password

**Validation:**
- Both fields required
- No format validation (username is arbitrary)

**Flow:**
1. POST `/auth/employee/login`
2. Receive: `{ access_token, user_id, first_login }`
3. Store token in SecureStore
4. If `first_login === true`:
   - Navigate to `/(auth)/change-password`
5. Else:
   - Navigate to `/(employee)/home`

**Error Messages:**
- Invalid credentials: "Kullanıcı adı veya şifre hatalı"
- Account disabled: "Hesabınız devre dışı"

---

#### 5. Change Password (`change-password.tsx`)
**Purpose:** Mandatory first-login password change

**Inputs:**
- New Password
- Confirm New Password

**Validation:**
- Min 6 characters
- Passwords match

**Flow:**
1. POST `/auth/employee/change-password { user_id, new_password }`
2. Backend updates password, sets first_login=false
3. Navigate to `/(employee)/home`

**Security:**
- Cannot go back (back button disabled)
- Cannot skip (enforced by route guard)

---

### Manager Screens

#### 6. Dashboard (`dashboard.tsx`)
**Layout:**
- Header: Store name + Manager email
- Stats Cards:
  - Pending requests count (badge)
  - This week status (pending/approved)
  - Employee count
- Quick Action Buttons:
  - "Çalışanları Görüntüle"
  - "Shift Onayları"
  - "Ayarlar"

**API Calls:**
- GET `/manager/dashboard-stats`
  - Response: `{ pending_count, week_status, employee_count }`

**Refresh:** Pull-to-refresh

---

#### 7. Employees List (`employees.tsx`)
**Layout:**
- SearchBar (filter by name/username)
- FlatList (virtualized, 20 items per page)
- FAB (Floating Action Button) → Add Employee

**Employee Card:**
- Avatar (initials)
- Name
- Username
- Status badge (active/inactive)
- Last shift date

**Interactions:**
- Tap card → `employee-detail/[id]`
- Swipe left → Delete (with confirmation modal)

**API Calls:**
- GET `/manager/employees`
- DELETE `/manager/employees/:id`

**Search:** Client-side filtering (employees array cached)

---

#### 8. Add Employee (`add-employee.tsx`)
**Inputs:**
- Full Name
- Username (validate uniqueness on blur)

**Auto-Generated:**
- Temporary Password (8 chars, shown to manager to copy)

**Validation:**
- Name min 2 chars
- Username min 3 chars, alphanumeric only
- Username uniqueness (API check)

**Flow:**
1. Validate inputs
2. POST `/manager/employees { name, username }`
3. Backend generates password, creates employee
4. Show success modal with credentials:
   - Username: xxx
   - Temporary Password: xxx
   - "Kopyala" button
5. Navigate back to employees list

**API:**
- POST `/manager/employees`
- Response: `{ employee_id, username, temp_password }`

---

#### 9. Employee Detail (`employee-detail/[id].tsx`)
**Sections:**

**1. Employee Info (Read-Only):**
- Name
- Username
- Created date
- Last login

**2. Manager Notes (Editable):**
- Textarea (500 char limit)
- Auto-save on blur (debounced 1s)
- Example: "Ali sabah shift'lerinde performanslı"

**3. Shift History:**
- Last 4 weeks (compact calendar view)
- Total hours worked

**4. Danger Zone:**
- Delete button (red, bottom)

**API Calls:**
- GET `/manager/employees/:id`
- PATCH `/manager/employees/:id/notes`
- DELETE `/manager/employees/:id`

---

#### 10. Shift Review (`shift-review.tsx`)
**Purpose:** Review and approve AI-generated shifts

**Layout:**
- Week selector (date picker)
- Status badge: "Pending" | "Generated" | "Approved"
- "AI Önerisi Al" button (if not generated)
- Shift Grid (7 days x 30-min slots)
- "Düzenle" toggle (enable manual editing)
- "Onayla ve Gönder" button (primary, bottom)

**Shift Grid:**
- 7 columns (Mon-Sun)
- Rows: 08:00 - 23:00 (30 slots)
- Each cell: Employee name or empty
- Color-coded by employee (consistent colors)

**AI Generation Flow:**
1. Manager clicks "AI Önerisi Al"
2. POST `/shifts/generate-schedule { week_start, manager_id }`
3. Backend:
   - Fetches all employee preferences for the week
   - Fetches manager notes for each employee
   - Calls Llama API with structured prompt
   - Receives JSON schedule
   - Stores in DB with status="generated"
4. Frontend displays schedule in grid

**Manual Editing:**
1. Toggle "Düzenle" mode
2. Tap cell → show employee picker modal
3. Select employee → assign to slot
4. Changes tracked locally
5. On approve: PATCH `/shifts/manual-edit` then POST `/shifts/approve`

**API Calls:**
- GET `/shifts/requests?week=YYYY-MM-DD`
- POST `/shifts/generate-schedule`
- PATCH `/shifts/manual-edit`
- POST `/shifts/approve`

---

#### 11. Settings (`settings.tsx`)
**Options:**

**Deadline Configuration:**
- Label: "Shift talep son günü"
- Picker: Monday - Friday
- Save: PATCH `/manager/settings`

**Store Info:**
- Store name (editable)
- Manager email (read-only)

**Actions:**
- Logout button (bottom)

**API:**
- GET `/manager/settings`
- PATCH `/manager/settings`

---

### Employee Screens

#### 12. Home (`home.tsx`)
**Layout:**
- Header: Welcome + Employee name
- Status Card:
  - Current week shift status
    - "Tercihlerin bekleniyor" (red, if not submitted)
    - "Tercihler gönderildi" (yellow, if pending approval)
    - "Shift onaylandı" (green, if approved)
  - Deadline countdown (if pending)
- This Week Schedule:
  - Compact calendar (show only approved shifts)
  - Empty state: "Shift henüz onaylanmadı"

**API Calls:**
- GET `/shifts/my-status?week=current`

**Navigation:**
- "Tercihleri Gir" button → shift-preferences
- Calendar tap → my-shifts

---

#### 13. Shift Preferences (`shift-preferences.tsx`)
**Purpose:** Employee selects availability for upcoming week

**Layout:**
- Week selector (next week only)
- Shift Grid (interactive)
- Legend:
  - Yeşil: Müsaitim
  - Kırmızı: Müsait Değilim
  - Gri: Off Talebi
- "Tercihleri Kaydet" button (bottom)

**Shift Grid Interaction:**
1. Initial state: All slots white (no preference)
2. Tap slot → cycle colors: white → green → red → gray → white
3. Long press → start drag mode
4. Drag across slots → apply same color
5. Auto-save draft to local state (every 5s)

**Validation:**
- Cannot submit after deadline
- Must select at least 20 hours of availability (configurable)
- Show warning if insufficient hours

**API Calls:**
- GET `/shifts/my-preferences?week=YYYY-MM-DD` (load draft)
- POST `/shifts/preferences` (submit final)

**Draft Storage:**
- Local state (React state)
- Persist to AsyncStorage (offline support)

---

#### 14. My Shifts (`my-shifts.tsx`)
**Purpose:** View approved shift history

**Layout:**
- Week selector (past/current/future)
- Calendar view (approved shifts only)
- Weekly stats:
  - Total hours
  - Shift count
  - Days worked

**API Calls:**
- GET `/shifts/my-shifts?week=YYYY-MM-DD`

**Empty State:**
- "Bu hafta için shift onaylanmadı"

---

#### 15. Profile (`profile.tsx`)
**Sections:**

**1. Basic Info:**
- Username (read-only)
- Full Name (editable)

**2. Security:**
- "Şifre Değiştir" button → change-password screen

**3. Actions:**
- Logout button

**API:**
- PATCH `/employee/profile`

---

## Data Models & API Contract

### TypeScript Types

```typescript
// types/auth.ts
export type UserType = 'manager' | 'employee';

export interface Manager {
  id: string;
  email: string;
  store_name: string;
  deadline_day: number; // 1-5 (Mon-Fri)
  created_at: string;
}

export interface Employee {
  id: string;
  manager_id: string;
  username: string;
  full_name: string;
  first_login: boolean;
  manager_notes: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  last_login: string | null;
}

// types/shift.ts
export type SlotStatus = 'available' | 'unavailable' | 'off_request';

export interface TimeSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time: string; // 'HH:MM-HH:MM' e.g. '08:00-08:30'
  status: SlotStatus;
}

export interface ShiftPreference {
  id: string;
  employee_id: string;
  week_start: string; // 'YYYY-MM-DD'
  slots: TimeSlot[];
  submitted_at: string | null;
}

export interface AssignedShift {
  employee_id: string;
  employee_name: string;
  day: string;
  start_time: string; // 'HH:MM'
  end_time: string; // 'HH:MM'
}

export interface WeekSchedule {
  id: string;
  manager_id: string;
  week_start: string;
  status: 'pending' | 'generated' | 'approved';
  shifts: AssignedShift[];
  generated_at: string | null;
  approved_at: string | null;
}

// types/api.ts
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  access_token: string;
  user_id: string;
  user_type: UserType;
  first_login?: boolean;
}

export interface DashboardStats {
  pending_requests: number;
  week_status: 'pending' | 'generated' | 'approved';
  employee_count: number;
}
```

### API Endpoints

**Base URL:** `https://api.shiffy.com` (env variable)

#### Authentication
```
POST /auth/employee/login
Body: { username, password }
Response: { access_token, user_id, first_login }

POST /auth/employee/change-password
Body: { user_id, new_password }
Response: { success: true }
```

#### Manager
```
GET /manager/dashboard-stats
Response: { pending_requests, week_status, employee_count }

GET /manager/employees
Response: { employees: Employee[] }

POST /manager/employees
Body: { full_name, username }
Response: { employee_id, username, temp_password }

GET /manager/employees/:id
Response: { employee: Employee }

PATCH /manager/employees/:id/notes
Body: { notes: string }
Response: { success: true }

DELETE /manager/employees/:id
Response: { success: true }

GET /manager/settings
Response: { deadline_day, store_name }

PATCH /manager/settings
Body: { deadline_day?, store_name? }
Response: { success: true }
```

#### Shifts
```
GET /shifts/requests?week=YYYY-MM-DD
Response: { requests: ShiftPreference[] }

POST /shifts/generate-schedule
Body: { week_start, manager_id }
Response: { schedule: WeekSchedule }

PATCH /shifts/manual-edit
Body: { schedule_id, changes: AssignedShift[] }
Response: { success: true }

POST /shifts/approve
Body: { schedule_id }
Response: { success: true }

GET /shifts/my-preferences?week=YYYY-MM-DD
Response: { preference: ShiftPreference | null }

POST /shifts/preferences
Body: { week_start, slots: TimeSlot[] }
Response: { success: true }

GET /shifts/my-shifts?week=YYYY-MM-DD
Response: { shifts: AssignedShift[] }

GET /shifts/my-status?week=current
Response: { status: string, deadline: string, approved: boolean }
```

---

## State Management Strategy

### Philosophy
**No Redux/Zustand for MVP** - Over-engineering for hackathon timeline

**Approach:**
- Local component state (`useState`)
- Custom hooks for shared logic
- Context only if absolutely necessary (not needed for MVP)

### Custom Hooks

#### useAuth
**Purpose:** Manage authentication state and actions

**Exports:**
```typescript
{
  user: Manager | Employee | null,
  userType: UserType | null,
  loading: boolean,
  error: string | null,
  login: (credentials) => Promise<void>,
  logout: () => Promise<void>,
  isAuthenticated: boolean,
}
```

**Implementation:**
- Check SecureStore on mount
- Validate token with backend
- Auto-refresh on 401

---

#### useEmployees (Manager Only)
**Purpose:** Employee CRUD operations

**Exports:**
```typescript
{
  employees: Employee[],
  loading: boolean,
  error: string | null,
  fetchEmployees: () => Promise<void>,
  addEmployee: (data) => Promise<void>,
  updateEmployee: (id, data) => Promise<void>,
  deleteEmployee: (id) => Promise<void>,
}
```

**Caching:**
- Cache employee list for 5 minutes
- Invalidate on add/update/delete

---

#### useShifts
**Purpose:** Shift data fetching and submission

**Exports:**
```typescript
{
  preferences: ShiftPreference | null,
  schedule: WeekSchedule | null,
  loading: boolean,
  submitPreferences: (slots) => Promise<void>,
  generateSchedule: (week) => Promise<void>,
  approveSchedule: (id) => Promise<void>,
}
```

---

## Testing Guidelines

### Strategy
- **Unit Tests:** Components, utils, hooks (80% coverage)
- **Integration Tests:** Critical user flows (auth, shift submission)
- **E2E Tests:** Not required for MVP (time constraint)

### Test Structure
```
test/
├── components/
│   ├── ui/
│   │   ├── Button.test.tsx
│   │   └── Input.test.tsx
│   └── shift/
│       └── ShiftGrid.test.tsx
├── screens/
│   ├── auth/
│   │   └── manager-login.test.tsx
│   └── employee/
│       └── shift-preferences.test.tsx
├── services/
│   └── auth.test.ts
├── hooks/
│   └── useAuth.test.ts
└── utils/
    └── validators.test.ts
```

### Key Test Cases

**Auth Flow:**
```
✓ Manager register creates Supabase user + DB entry
✓ Employee login with first_login=true redirects to change password
✓ Token stored in SecureStore
✓ 401 response triggers logout
```

**Shift Grid:**
```
✓ Tap slot cycles colors correctly
✓ Long press enables drag mode
✓ Cannot submit after deadline (validation)
✓ Draft auto-saves every 5s
```

**Manager Actions:**
```
✓ Add employee validates username uniqueness
✓ Delete employee shows confirmation modal
✓ Shift approval sends correct payload
```

### Testing Tools
```json
{
  "jest": "^29.7.0",
  "@testing-library/react-native": "^12.4.0",
  "@testing-library/jest-native": "^5.4.3"
}
```

### Example Test Pattern
```typescript
// test/components/ui/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders title correctly', () => {
    const { getByText } = render(<Button title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test" onPress={onPress} />);
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test" loading onPress={onPress} />);
    fireEvent.press(getByText('Test'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

---

## Development Workflow

### Git Strategy

**Branch Naming:**
```
feature/auth-screens
feature/shift-grid
fix/login-validation
hotfix/token-refresh
```

**Commit Messages:**
```
[Frontend] Add employee login screen
[Frontend] Fix shift grid color cycling
[Frontend] Update API error handling
[Frontend] Refactor useAuth hook
```

**PR Requirements:**
1. All tests pass (`npm test`)
2. TypeScript compiles (`npm run tsc`)
3. Lint passes (`npm run lint`)
4. Code reviewed by 1 team member
5. Update relevant docs/ if API/structure changes

### Code Review Checklist
- [ ] Follows KISS principle (no over-engineering)
- [ ] No `any` types in TypeScript
- [ ] Loading states for async operations
- [ ] Error handling implemented
- [ ] Components under 300 lines
- [ ] Functions under 50 lines
- [ ] Tests added for new features

### Environment Setup

**Development:**
- Use Expo Go app for iOS/Android testing
- Hot reload enabled
- Debug mode on
- Mock API responses for faster iteration (optional)

**Staging:**
- Test with actual backend integration
- Use staging API URL

**Production:**
- Build standalone app (`eas build`)
- Environment variables from Expo EAS

### Daily Workflow (Hackathon)

**Day 1 (Friday 16:00 - 00:00):**
- Setup project structure
- Implement auth screens
- Basic navigation

**Day 2 (Saturday 00:00 - 24:00):**
- Manager screens (dashboard, employees, shift review)
- Employee screens (home, preferences)
- Shift grid component
- API integration

**Day 3 (Sunday 00:00 - 12:00):**
- Testing & bug fixes
- UI polish (minimal, focus on functionality)
- Documentation updates
- Prepare demo

---

## MVP Checklist

### Must-Have (P0)
- [ ] All auth screens functional
- [ ] Manager can add/delete employees
- [ ] Employee can submit shift preferences
- [ ] Manager can view AI-generated schedule
- [ ] Manager can approve schedule
- [ ] Employee can view approved shifts
- [ ] All API integrations working
- [ ] Basic error handling

### Nice-to-Have (P1)
- [ ] Manual shift editing (drag-drop)
- [ ] Draft auto-save for preferences
- [ ] Pull-to-refresh on lists
- [ ] Search in employee list
- [ ] Loading skeletons

### Post-MVP (P2)
- [ ] Push notifications
- [ ] Offline mode
- [ ] Advanced analytics
- [ ] UI animations
- [ ] Accessibility improvements

---

## Performance Considerations

### Optimization Strategies
- FlatList virtualization for employee lists
- Image caching for avatars (if added)
- Lazy loading for shift history
- Debounced auto-save (1s delay)
- Memoization for expensive calculations

### Bundle Size Target
- Initial: < 50MB
- After optimization: < 30MB

---

## Accessibility (Future)
- Screen reader support
- High contrast mode
- Larger touch targets (44x44pt minimum)
- Keyboard navigation (web version)

---

## Support & Resources

**Documentation:**
- Expo SDK 54: https://docs.expo.dev
- Supabase: https://supabase.com/docs
- React Native: https://reactnative.dev

**Team Resources:**
- Backend API Contract: `/docs/API.md`
- Database Schema: `/docs/DATABASE_SCHEMA.md`
- Discord Channel: #shiffy-dev

**Troubleshooting:**
- Expo CLI issues: `npx expo-doctor`
- Dependency conflicts: `rm -rf node_modules && npm install`
- iOS build: Check Xcode version compatibility

---

**Document Version:** 1.0.0  
**Last Updated:** October 24, 2025  
**Maintainers:** Frontend Team (Golden Head)  
**Next Review:** Post-MVP (October 27, 2025)