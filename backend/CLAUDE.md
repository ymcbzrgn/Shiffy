# Claude's Backend Development Guide for Shiffy

**Project:** Shiffy - AI-Powered Shift Management System
**Role:** Backend Developer
**Timeline:** Meta & YTU Llama Hackathon (Oct 24-26, 2025)
**Goal:** Build a working MVP that demonstrates value, not perfect architecture

---

## Core Principles

### 1. KISS (Keep It Simple, Stupid)
- ✅ **Direct Supabase queries** - No ORM complexity
- ✅ **Flat file structure** - Max 2 levels deep
- ✅ **No unnecessary abstractions** - Write code that solves the problem directly
- ❌ **No design patterns** unless they save significant time
- ❌ **No premature optimization** - Make it work first

### 2. CLEAN Code Standards
```typescript
// ✅ GOOD: Clear, self-documenting
async function createEmployee(managerId: string, fullName: string, username: string) {
  const tempPassword = generateRandomPassword(8);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const { data, error } = await supabase
    .from('employees')
    .insert({ manager_id: managerId, full_name: fullName, username, password_hash: passwordHash })
    .select()
    .single();

  if (error) throw new Error(`Failed to create employee: ${error.message}`);
  return { employee: data, tempPassword };
}

// ❌ BAD: Complex, over-engineered
class EmployeeFactory implements IEmployeeCreator {
  constructor(private repository: IEmployeeRepository) {}
  async create(dto: CreateEmployeeDTO): Promise<EmployeeEntity> { ... }
}
```

**Rules:**
- Max **50 lines per function** (if longer, split logically)
- Max **300 lines per file** (if longer, refactor)
- **No `any` types** in TypeScript (use `unknown` or specific types)
- **Descriptive names** - `fetchEmployeesByManager` not `getEmps`
- **Async/await** everywhere - no callbacks or raw promises

### 3. No Over-Engineering for MVP
**Ask yourself:** "Will this be used in the 48-hour demo?"

| Feature | MVP Decision |
|---------|--------------|
| Authentication | ✅ Simple JWT (7-day expiry, no refresh token) |
| Error tracking | ❌ Skip Sentry, use console.error |
| API docs | ❌ Skip Swagger, maintain API.md |
| Caching | ❌ Direct DB queries (Supabase is fast) |
| Audit logs | ❌ Post-MVP feature |
| WebSockets | ❌ REST API only |
| Rate limiting | ✅ Basic express-rate-limit |

---

## Architecture Quick Reference

### Clean Layering (3 Layers Only)
```
┌─────────────────────────────────────┐
│  ROUTES (auth, manager, employee)   │  ← Handle HTTP, validate input
├─────────────────────────────────────┤
│  SERVICES (business logic)          │  ← Core logic, call Llama API
├─────────────────────────────────────┤
│  REPOSITORIES (data access)         │  ← Supabase queries only
└─────────────────────────────────────┘
```

**File Structure Pattern:**
```
src/
├── routes/          # Express router handlers
│   └── auth.routes.ts        # POST /auth/employee/login
├── services/        # Business logic
│   └── auth.service.ts       # validateCredentials(), generateJWT()
├── repositories/    # Database queries
│   └── employee.repository.ts  # findByUsername(), updatePassword()
├── middleware/      # JWT verification, error handling
├── utils/           # Pure functions (no dependencies)
└── config/          # Supabase client, env variables
```

### Database Schema (5 Tables)
```sql
managers          → Supabase Auth users (email/password)
  ├── employees   → Custom auth (username/password)
  │    └── shift_preferences  → JSONB slots array
  └── schedules   → AI-generated shifts (JSONB)
```

**Key Relationships:**
- One manager has many employees (`manager_id` FK)
- One employee has many preferences (`employee_id` FK)
- One manager has many schedules (`manager_id` FK)

---

## Code Patterns (Copy-Paste Ready)

### 1. API Endpoint Template
```typescript
// routes/employee.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { employeeService } from '../services/employee.service';

const router = Router();

router.post('/employees', authMiddleware, async (req, res) => {
  try {
    const { full_name, username } = req.body;
    const managerId = req.user.user_id; // From JWT middleware

    // Validate input
    if (!full_name || !username) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Call service
    const result = await employeeService.createEmployee(managerId, full_name, username);

    // Success response
    return res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Create employee error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
```

### 2. Service Layer Pattern
```typescript
// services/employee.service.ts
import bcrypt from 'bcrypt';
import { employeeRepository } from '../repositories/employee.repository';
import { generateRandomPassword } from '../utils/password.utils';

export const employeeService = {
  async createEmployee(managerId: string, fullName: string, username: string) {
    // Check username uniqueness
    const existing = await employeeRepository.findByUsername(username);
    if (existing) {
      throw new Error('Username already exists');
    }

    // Generate credentials
    const tempPassword = generateRandomPassword(8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create employee
    const employee = await employeeRepository.create({
      manager_id: managerId,
      full_name: fullName,
      username,
      password_hash: passwordHash,
      first_login: true,
    });

    return {
      employee_id: employee.id,
      username: employee.username,
      temp_password: tempPassword, // Only returned once
    };
  },
};
```

### 3. Repository Pattern
```typescript
// repositories/employee.repository.ts
import { supabase } from '../config/supabase.config';

export const employeeRepository = {
  async findByUsername(username: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  async create(employee: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single();

    if (error) throw new Error(`Failed to create employee: ${error.message}`);
    return data;
  },
};
```

### 4. JWT Middleware
```typescript
// middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    req.user = decoded; // Attach user info to request
    next();

  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
```

### 5. Llama API Integration (RunPod Ollama)
```typescript
// services/llama.service.ts
import { config } from '../config/env.config';

export const llamaService = {
  async generateSchedule(
    storeName: string,
    weekStart: string,
    employees: any[]
  ) {
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
          system_prompt_key: 'shift_scheduler', // Proxy injects system prompt
          prompt,
          model: 'llama3.1:8b-instruct-q6_K',
          stream: false,
          validate: true, // Proxy validates JSON schema
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

    // Check validation (proxy validates against schema)
    if (!data.validation?.ok) {
      throw new Error('Schedule validation failed');
    }

    // Return parsed JSON (proxy already parsed it)
    return data.parsed; // { shifts: [...], summary: {...} }
  },
};

function buildSchedulePrompt(
  storeName: string,
  weekStart: string,
  employees: any[]
): string {
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

**Key differences from standard Llama API:**
- ✅ Custom endpoint: `/api/generate-with-system` (not OpenAI-compatible)
- ✅ Authentication: `x-api-key` header (not Bearer token)
- ✅ System prompt: Injected by proxy via `system_prompt_key`
- ✅ Validation: Proxy validates JSON schema automatically
- ✅ Response: `data.parsed` contains ready-to-use JSON

---

## Error Handling Strategy

### Consistent Error Responses
```typescript
// ✅ SUCCESS
{
  "success": true,
  "data": { ... }
}

// ❌ ERROR
{
  "success": false,
  "error": "Human-readable message",
  "code": "OPTIONAL_ERROR_CODE"  // Optional for frontend logic
}
```

### Status Codes
- **200** - Success (GET, PATCH, DELETE)
- **201** - Created (POST)
- **400** - Bad Request (validation failed)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (valid token, insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error (catch-all)

### Try-Catch Every Async Function
```typescript
// ✅ ALWAYS wrap async operations
async function doSomething() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw new Error(`Failed to do something: ${error.message}`);
  }
}
```

---

## Testing Strategy (80/20 Rule)

### What to Test (Focus Here)
✅ **Utils** - Pure functions (password generation, validators)
✅ **Services** - Business logic (createEmployee, generateSchedule)
✅ **Auth** - Login, JWT validation, password change

### What NOT to Test (Skip for MVP)
❌ Database queries (trust Supabase)
❌ External APIs (mock Llama responses)
❌ E2E flows (manual testing is faster)

### Test Pattern
```typescript
// test/unit/utils/password.utils.test.ts
import { generateRandomPassword } from '../../../src/utils/password.utils';

describe('generateRandomPassword', () => {
  it('should generate password of specified length', () => {
    const password = generateRandomPassword(8);
    expect(password).toHaveLength(8);
  });

  it('should only contain alphanumeric characters', () => {
    const password = generateRandomPassword(12);
    expect(password).toMatch(/^[A-Za-z0-9]+$/);
  });
});
```

**Run Tests:**
```bash
npm test              # All tests
npm test -- --watch   # Watch mode
npm run test:coverage # Coverage report
```

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Forgetting RLS Policies
```typescript
// Problem: Service role key bypasses RLS
// Solution: Always filter by manager_id/employee_id in queries

// ❌ BAD - Returns all employees
const { data } = await supabase.from('employees').select('*');

// ✅ GOOD - Filter by manager
const { data } = await supabase
  .from('employees')
  .select('*')
  .eq('manager_id', managerId);
```

### ❌ Pitfall 2: Not Hashing Passwords
```typescript
// ❌ BAD - Storing plaintext
await supabase.from('employees').insert({ password: 'plain123' });

// ✅ GOOD - Always hash with bcrypt
const hash = await bcrypt.hash(password, 10);
await supabase.from('employees').insert({ password_hash: hash });
```

### ❌ Pitfall 3: Forgetting Error Handling
```typescript
// ❌ BAD - Unhandled promise rejection
app.post('/employees', async (req, res) => {
  const result = await employeeService.createEmployee(...); // Crashes on error
  res.json(result);
});

// ✅ GOOD - Try-catch wrapper
app.post('/employees', async (req, res) => {
  try {
    const result = await employeeService.createEmployee(...);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### ❌ Pitfall 4: Blocking the Event Loop
```typescript
// ❌ BAD - Synchronous bcrypt blocks Node.js
const hash = bcrypt.hashSync(password, 10);

// ✅ GOOD - Async version
const hash = await bcrypt.hash(password, 10);
```

### ❌ Pitfall 5: Orphaned Background Processes
```bash
# Problem: Running `npm run dev` multiple times creates zombie processes
# Each failed start leaves a background shell running

# ❌ BAD - Just killing the successful process
# Shell 52d75e (failed, port taken) → Still running ❌
# Shell ae3585 (succeeded) → Killed ✅

# ✅ GOOD - Kill ALL background shells before finishing
# Check all running shells: /bashes command
# Kill each one: Use KillShell for every background bash ID

# Verify port is clean
lsof -ti:3000 || echo "Port 3000 is clean"

# If port is occupied, force kill
lsof -ti:3000 | xargs kill -9
```

**Golden Rule:** Before marking Phase complete, verify:
1. All background shells are killed (`/bashes` shows empty)
2. Port 3000 is free (`lsof -ti:3000` returns nothing)
3. Only intentional services are running

---

## MVP Checklist (Priority Order)

### Phase 1: Core Auth (Day 1 - 4 hours)
- [ ] Employee login (`POST /auth/employee/login`)
- [ ] Password change (`POST /auth/employee/change-password`)
- [ ] JWT middleware (`authMiddleware`)
- [ ] Test: Login flow works end-to-end

### Phase 2: Manager CRUD (Day 1 - 4 hours)
- [ ] Create employee (`POST /manager/employees`)
- [ ] List employees (`GET /manager/employees`)
- [ ] Update notes (`PATCH /manager/employees/:id/notes`)
- [ ] Delete employee (`DELETE /manager/employees/:id`)
- [ ] Test: Manager can manage employees

### Phase 3: Shift Preferences (Day 2 - 4 hours)
- [ ] Submit preferences (`POST /shifts/preferences`)
- [ ] Get preferences (`GET /shifts/my-preferences`)
- [ ] View requests (`GET /shifts/requests`) - Manager view
- [ ] Test: Employee can submit, manager can view

### Phase 4: AI Schedule Generation (Day 2 - 6 hours)
- [ ] Llama API integration (`services/llama.service.ts`)
- [ ] Generate schedule (`POST /shifts/generate-schedule`)
- [ ] Approve schedule (`POST /shifts/approve`)
- [ ] Employee view shifts (`GET /shifts/my-shifts`)
- [ ] Test: Full AI generation flow

### Phase 5: Cron Job (Day 3 - 2 hours)
- [ ] Schedule generation cron (`cron/shift-generation.cron.ts`)
- [ ] Test: Runs at midnight for deadline managers

### Phase 6: Deployment (Day 3 - 2 hours)
- [ ] Deploy to Oracle Cloud
- [ ] Setup PM2 + Nginx
- [ ] Environment variables configured
- [ ] Test: Production endpoints work

---

## Quick Commands

### Development
```bash
npm run dev          # Start dev server (nodemon)
npm test            # Run tests
npm run build       # Compile TypeScript
npm start           # Start production server
```

### Deployment (Oracle Cloud)
```bash
ssh ubuntu@<oracle-ip>
cd /var/www/shiffy/backend
git pull origin main
npm install
npm run build
pm2 restart shiffy-backend
pm2 logs shiffy-backend --lines 50
```

### Debugging
```bash
# Check if server is running
curl http://localhost:3000/health

# Check for orphaned background processes (IMPORTANT!)
lsof -ti:3000  # Should be empty if server is stopped

# View PM2 logs
pm2 logs shiffy-backend --err

# Test Supabase connection
node -e "const {createClient}=require('@supabase/supabase-js'); createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY).from('managers').select('count').then(console.log)"

# Test Llama API
curl -X POST $RUNPOD_API_URL/health
```

---

## Git Workflow (CRITICAL)

### 🚨 Commit Policy - NEVER Auto-Commit
**Rule:** Claude NEVER makes commits automatically. User makes ALL commits manually.

### When to Ask for Commit:
✅ **Phase completion** (e.g., Phase 0 structure, Phase 1 auth)
✅ **Major feature completion** (e.g., all CRUD endpoints working)
✅ **Before risky refactoring** (create safe restore point)
✅ **Before deployment** (ensure clean state)

❌ **DON'T ask for commit on:**
- Minor fixes (typo, single line change)
- Documentation updates (CHANGELOG.md, README.md)
- Intermediate work-in-progress

### Commit Request Template:
```
✅ [PHASE X COMPLETE] - Brief Description

This phase is complete and tested. Ready to commit.

Suggested commit message:
---
feat: [phase-name] - brief description

- Feature 1 added
- Feature 2 implemented
- Tests passing
---

**Can you commit these changes before we move to the next phase?**
(I'll wait for your commit confirmation before proceeding)
```

### Example Flow:
```
Claude: ✅ Phase 0 Complete! Backend structure ready.
        npm install ✅
        npm run build ✅
        npm run dev ✅

        Suggested commit:
        "feat: phase 0 backend structure setup"

        Can you commit before Phase 1?

User: [runs git add . && git commit -m "..."]
      Done!

Claude: Great! Moving to Phase 1...
```

### Why Manual Commits?
1. **User control** - You decide what gets committed and when
2. **Custom messages** - You write commit messages in your style
3. **Review opportunity** - Check changes before committing
4. **Git history ownership** - Your name, your commits

---

## Key Reminders for Claude

### When Writing Code:
1. **Start simple** - One file, one responsibility
2. **Write tests for utils** - Catch bugs early
3. **Log errors** - `console.error` is enough for MVP
4. **Use TypeScript types** - No `any`, ever
5. **Handle promises** - Always `try/catch` async functions
6. **STOP and ask for commit** - After each phase completion (see Git Workflow above)

### When Stuck:
1. Check documentation (`SHIFFY_BACKEND_DOCS.md`)
2. Look at similar endpoint (pattern consistency)
3. Test manually with `curl` before writing tests
4. Ask: "Is this needed for the demo?" (probably not)

### When Tempted to Over-Engineer:
- **No design patterns** - Write straightforward code
- **No abstractions** - Direct Supabase calls
- **No optimization** - Make it work first
- **No fancy features** - Stick to MVP checklist

---

## Success Metrics
✅ All 20 API endpoints working
✅ Frontend can integrate successfully
✅ AI generates valid schedules
✅ Deployed and accessible at demo
✅ Code is readable and maintainable

**Remember:** A working MVP that's "good enough" beats perfect architecture that's half-done.

---

**Last Updated:** October 24, 2025 20:25 (Added Git Workflow - Manual Commit Policy)
**Version:** 1.1.0
**Maintainer:** Claude (Backend Developer)
