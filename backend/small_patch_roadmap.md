# Backend Patch Roadmap: Employee Creation Enhancement

**Feature:** Add `job_description` and `max_weekly_hours` fields to employee creation
**Priority:** 🔴 CRITICAL (Blocks frontend integration)
**Target:** Before Oracle deployment (Oct 26, 2025)
**Estimated Time:** 2-3 hours

---

## 📋 Implementation Checklist

### Phase 1: Database Migration (20 min)
**Priority:** P0 - Must do first

- [ ] **Create migration file**
  - File: `src/scripts/migrations/003_add_employee_fields.sql`
  - Add `job_description VARCHAR(255)` column
  - Add `max_weekly_hours INTEGER CHECK (...)` column
  - Add column comments for documentation

- [ ] **Run migration**
  ```bash
  npm run migrate
  ```

- [ ] **Verify migration**
  ```bash
  # Check columns exist
  psql $DATABASE_URL -c "\d employees"
  ```

**Files to create:**
- `src/scripts/migrations/003_add_employee_fields.sql`

---

### Phase 2: TypeScript Types (15 min)
**Priority:** P0 - Required for compilation

- [ ] **Update `src/types/employee.types.ts`**
  - Add `job_description: string | null` to `Employee` interface
  - Add `max_weekly_hours: number | null` to `Employee` interface

- [ ] **Update `src/types/manager.types.ts`**
  - Add `job_description?: string | null` to `CreateEmployeeRequest` interface
  - Add `max_weekly_hours?: number | null` to `CreateEmployeeRequest` interface

**Files to modify:**
- `src/types/employee.types.ts` (line ~10)
- `src/types/manager.types.ts` (line ~13)

**Diff Preview:**
```typescript
// src/types/employee.types.ts
export interface Employee {
  id: string;
  manager_id: string;
  username: string;
  full_name: string;
+ job_description: string | null;
+ max_weekly_hours: number | null;
  password_hash: string;
  first_login: boolean;
  // ...
}

// src/types/manager.types.ts
export interface CreateEmployeeRequest {
  full_name: string;
  username: string;
+ job_description?: string | null;
+ max_weekly_hours?: number | null;
}
```

---

### Phase 3: API Routes (20 min)
**Priority:** P0 - API contract implementation

- [ ] **Update `src/routes/manager.routes.ts`**
  - Extract `job_description` from `req.body` (line ~51)
  - Extract `max_weekly_hours` from `req.body` (line ~51)
  - Add validation for `max_weekly_hours` (0-60 range, integer only)
  - Pass both fields to `managerService.createEmployee()`

**File to modify:**
- `src/routes/manager.routes.ts` (lines 48-84)

**Diff Preview:**
```typescript
// src/routes/manager.routes.ts:48-62
router.post('/employees', managerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const managerId = req.user!.user_id;
-   const { full_name, username } = req.body as CreateEmployeeRequest;
+   const { full_name, username, job_description, max_weekly_hours } = req.body as CreateEmployeeRequest;

    // Validate input
    if (!full_name || !username) {
      return res.status(400).json({
        success: false,
        error: 'full_name ve username alanları gereklidir',
      });
    }

+   // Validate max_weekly_hours (if provided)
+   if (max_weekly_hours !== undefined && max_weekly_hours !== null) {
+     if (!Number.isInteger(max_weekly_hours) || max_weekly_hours < 0 || max_weekly_hours > 60) {
+       return res.status(400).json({
+         success: false,
+         error: 'max_weekly_hours 0 ile 60 arasında bir tam sayı olmalıdır',
+       });
+     }
+   }

    // Create employee
-   const result = await managerService.createEmployee(managerId, full_name, username);
+   const result = await managerService.createEmployee(
+     managerId,
+     full_name,
+     username,
+     job_description ?? null,
+     max_weekly_hours ?? null
+   );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    // ... error handling
  }
});
```

---

### Phase 4: Service Layer (15 min)
**Priority:** P0 - Business logic

- [ ] **Update `src/services/manager.service.ts`**
  - Update `createEmployee` function signature (line ~41)
  - Add `jobDescription` parameter
  - Add `maxWeeklyHours` parameter
  - Pass both to repository layer

**File to modify:**
- `src/services/manager.service.ts` (lines 31-75)

**Diff Preview:**
```typescript
// src/services/manager.service.ts:41-75
export async function createEmployee(
  managerId: string,
  fullName: string,
- username: string
+ username: string,
+ jobDescription: string | null = null,
+ maxWeeklyHours: number | null = null
): Promise<CreateEmployeeResponse> {
  try {
    // Check if username already exists
    const existingEmployee = await employeeRepository.findByUsername(username);
    if (existingEmployee) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor');
    }

    // Generate random password (8 characters)
    const tempPassword = generateRandomPassword(8);

    // Hash password
    const passwordHash = await hashPassword(tempPassword);

    // Create employee
    const employee = await employeeRepository.create({
      manager_id: managerId,
      full_name: fullName,
      username,
+     job_description: jobDescription,
+     max_weekly_hours: maxWeeklyHours,
      password_hash: passwordHash,
      first_login: true,
    });

    return {
      employee: toEmployeeResponse(employee),
      temp_password: tempPassword,
    };
  } catch (error: any) {
    throw new Error(`Failed to create employee: ${error.message}`);
  }
}
```

---

### Phase 5: Repository Layer (10 min)
**Priority:** P0 - Database queries

- [ ] **Update `src/repositories/employee.repository.ts`**
  - Ensure `create()` function accepts `job_description` field
  - Ensure `create()` function accepts `max_weekly_hours` field
  - Supabase will automatically handle the new columns

**File to check:**
- `src/repositories/employee.repository.ts`

**Note:** If repository uses spread operator for INSERT, no changes needed:
```typescript
const { data, error } = await supabase
  .from('employees')
  .insert(employee) // ← Automatically includes all fields from 'employee' object
  .select()
  .single();
```

---

### Phase 6: AI Scheduler Integration (30 min)
**Priority:** P1 - Enhances AI quality

- [ ] **Update `src/services/llama.service.ts`**
  - Update `buildSchedulePrompt()` function (line ~115)
  - Include `job_description` in employee context
  - Include `max_weekly_hours` in constraints
  - Update AI instructions to respect max_weekly_hours

**File to modify:**
- `src/services/llama.service.ts` (lines 112-162)

**Diff Preview:**
```typescript
// src/services/llama.service.ts:115-150
buildSchedulePrompt(
  storeName: string,
  weekStart: string,
  employees: EmployeePreference[]
): string {
  const lines: string[] = [];

  lines.push(`STORE: ${storeName}`);
  lines.push(`WEEK: ${weekStart}`);
  lines.push(`OPERATING HOURS: 08:00-22:00 (Monday-Sunday)`);
  lines.push('');

  // Employee count
  lines.push(`TOTAL EMPLOYEES: ${employees.length}`);
  lines.push('');

  // Employee preferences
  for (const emp of employees) {
    lines.push(`EMPLOYEE ${emp.employee_id}: ${emp.full_name}`);

+   // Job description
+   if (emp.job_description) {
+     lines.push(`Job Description: ${emp.job_description}`);
+   }
+
+   // Max weekly hours
+   if (emp.max_weekly_hours !== null) {
+     if (emp.max_weekly_hours === 0) {
+       lines.push(`Status: ON LEAVE (do not schedule)`);
+     } else {
+       lines.push(`Max Weekly Hours: ${emp.max_weekly_hours}`);
+     }
+   }

    if (emp.notes) {
      lines.push(`Manager Notes: ${emp.notes}`);
    }

    lines.push('Availability:');

    if (emp.slots && emp.slots.length > 0) {
      for (const slot of emp.slots) {
        lines.push(`  ${slot.day} ${slot.time}: ${slot.status}`);
      }
    } else {
      lines.push('  No preferences submitted (use default availability)');
    }

    lines.push('');
  }

  lines.push('TASK: Generate optimal weekly shift schedule as JSON.');
  lines.push('RULES:');
  lines.push('- Each shift should be 8-9 hours');
  lines.push('- Respect employee availability (unavailable = cannot work)');
  lines.push('- Prefer available/preferred slots');
  lines.push('- off_request = employee wants day off (use as last resort)');
+ lines.push('- Respect max_weekly_hours (soft limit, try not to exceed)');
+ lines.push('- If max_weekly_hours = 0, skip employee entirely (on leave)');
  lines.push('- Distribute hours fairly among employees');
  lines.push('- Cover all operating hours (08:00-22:00)');

  return lines.join('\n');
}
```

**Note:** Also need to update `EmployeePreference` interface to include new fields:
```typescript
interface EmployeePreference {
  employee_id: string;
  full_name: string;
+ job_description: string | null;
+ max_weekly_hours: number | null;
  slots: Array<{...}>;
  notes?: string;
}
```

---

### Phase 7: Testing (30 min)
**Priority:** P1 - Quality assurance

- [ ] **Update test scripts**
  - Update `scripts/setup-test-data-for-ai.ts` to include new fields
  - Update `scripts/test-ai-generation.ts` to verify AI respects max_weekly_hours

- [ ] **Manual testing**
  ```bash
  # Test 1: Create employee with job_description
  curl -X POST http://localhost:3000/api/manager/employees \
    -H "Authorization: Bearer $MANAGER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"full_name":"Test User","username":"test.user","job_description":"Kasiyer","max_weekly_hours":40}'

  # Test 2: Create employee with max_weekly_hours=0 (on leave)
  curl -X POST http://localhost:3000/api/manager/employees \
    -H "Authorization: Bearer $MANAGER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"full_name":"Leave User","username":"leave.user","max_weekly_hours":0}'

  # Test 3: Invalid max_weekly_hours (should fail)
  curl -X POST http://localhost:3000/api/manager/employees \
    -H "Authorization: Bearer $MANAGER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"full_name":"Invalid User","username":"invalid.user","max_weekly_hours":100}'
  ```

- [ ] **Run AI generation test**
  ```bash
  npm run test:ai-generation
  # Verify AI respects max_weekly_hours in output
  ```

**Files to update:**
- `scripts/setup-test-data-for-ai.ts`
- `scripts/test-ai-generation.ts`

---

### Phase 8: Documentation (10 min)
**Priority:** P2 - Nice to have

- [ ] **Update CHANGELOG.md**
  - Document breaking changes (if any)
  - Document new fields

- [ ] **Update README.md (if needed)**
  - Add note about new employee fields

**Files to update:**
- `CHANGELOG.md`
- `README.md` (optional)

---

## 📦 Deliverables

### Required Before Oracle Deployment
- [x] API documentation (`docs/API_EMPLOYEE_CREATION.md`)
- [ ] Database migration (003_add_employee_fields.sql)
- [ ] Backend implementation (all phases 1-5)
- [ ] Basic testing (manual API tests)

### Nice to Have
- [ ] AI scheduler integration (Phase 6)
- [ ] Comprehensive test suite (Phase 7)
- [ ] Documentation updates (Phase 8)

---

## 🚀 Execution Plan

### Recommended Order
1. **Phase 1** → Create migration, run it
2. **Phase 2** → Update TypeScript types (fixes compilation)
3. **Phase 4** → Update service layer (business logic)
4. **Phase 3** → Update routes (API validation)
5. **Phase 5** → Verify repository (should work already)
6. **Phase 7** → Manual testing with curl
7. **Phase 6** → AI integration (can be done later)
8. **Phase 8** → Documentation (last)

### Time Estimates
- **Critical path (Phases 1-5):** 1.5 hours
- **Testing (Phase 7):** 30 min
- **AI integration (Phase 6):** 30 min
- **Total:** ~2.5 hours

---

## ⚠️ Risks & Mitigation

### Risk 1: Migration Fails
**Likelihood:** Low
**Impact:** High (blocks everything)
**Mitigation:**
- Test migration on local DB first
- Have rollback script ready
- Backup production DB before migration

### Risk 2: Frontend Deployed Before Backend
**Likelihood:** Medium
**Impact:** Medium (frontend shows fields but backend ignores them)
**Mitigation:**
- **API documentation contract** (already done ✅)
- Frontend can implement UI, backend must catch up
- Add validation on frontend to prevent bad UX

### Risk 3: AI Ignores max_weekly_hours
**Likelihood:** Medium
**Impact:** Low (feature works, just not optimally)
**Mitigation:**
- Phase 6 is P1 (not blocking)
- Can be improved post-deployment
- Current AI works, this is enhancement

---

## 🔄 Rollback Plan

If migration fails or causes issues:

```sql
-- Rollback migration
ALTER TABLE employees
DROP COLUMN job_description,
DROP COLUMN max_weekly_hours;
```

If API breaks:
- Revert commits for Phases 2-5
- Keep Phase 1 (migration) - columns will be null, which is safe

---

## ✅ Success Criteria

1. **Backend:**
   - Migration runs successfully
   - API accepts `job_description` and `max_weekly_hours`
   - API validates `max_weekly_hours` (0-60 range)
   - New employees have these fields in database

2. **Integration:**
   - Frontend can send new fields
   - Backend saves them correctly
   - AI scheduler uses `max_weekly_hours` in prompt

3. **Testing:**
   - All manual curl tests pass
   - AI generation respects max_weekly_hours=0 (skips employee)
   - AI generation tries to respect max_weekly_hours>0 (soft limit)

---

## 📞 Coordination with Frontend

### Frontend Team Must:
1. Add "İş Tanımı" field (text input, optional, max 255 chars)
2. Add "Maksimum Haftalık Saat" field (number input, optional, 0-60 range)
3. Show warning when max_weekly_hours=0 ("Bu çalışan çizelgeye dahil edilmeyecek")
4. Update `services/employee.ts` to include new fields in API call
5. Set `USE_MOCK = false` for testing with real backend

### Backend Team Must:
1. Complete Phases 1-5 (database + API implementation)
2. Test with curl before notifying frontend
3. Deploy to test environment for frontend integration testing
4. Complete Phase 6 (AI integration) before production

---

## 📝 Notes

- **Backward compatibility:** Existing employees will have `job_description=null` and `max_weekly_hours=null`, which is safe
- **Null handling:** Both fields are optional, nulls are allowed
- **AI behavior:** max_weekly_hours is a **soft limit**, not hard constraint
- **Zero hours:** Treated as "on leave" - AI should skip employee entirely

---

**Last Updated:** 2025-10-25
**Status:** 🚧 Ready to implement
**Owner:** Backend Team
