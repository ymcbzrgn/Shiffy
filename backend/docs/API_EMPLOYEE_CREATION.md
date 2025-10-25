# Employee Creation API Documentation

**Version:** 2.0 (Updated for job_description + max_weekly_hours)
**Last Updated:** 2025-10-25
**Status:** 🚧 PENDING BACKEND IMPLEMENTATION

---

## Overview

This document defines the API contract for creating employees via the manager interface. The backend implementation is tracked in `small_patch_roadmap.md`.

---

## Endpoint

```
POST /api/manager/employees
```

**Authentication:** Required (Manager JWT token)

**Headers:**
```
Authorization: Bearer <manager_jwt_token>
Content-Type: application/json
```

---

## Request Body

### Updated Schema (v2.0)

```json
{
  "full_name": "string (required)",
  "username": "string (required)",
  "job_description": "string | null (optional)",
  "max_weekly_hours": "number | null (optional)"
}
```

### Field Specifications

#### `full_name` (EXISTING)
- **Type:** `string`
- **Required:** ✅ Yes
- **Validation:**
  - Min length: 2 characters
  - Max length: 255 characters
  - Cannot be empty or whitespace-only
- **Example:** `"Ahmet Yılmaz"`, `"Zeynep Kaya"`

#### `username` (EXISTING)
- **Type:** `string`
- **Required:** ✅ Yes
- **Validation:**
  - Min length: 3 characters
  - Max length: 100 characters
  - Must be unique (case-insensitive)
  - Allowed characters: `a-z`, `0-9`, `.`, `_`
  - No spaces, uppercase, or special characters
- **Example:** `"ahmet.yilmaz"`, `"zeynep_kaya"`

#### `job_description` (NEW)
- **Type:** `string | null`
- **Required:** ❌ No (optional)
- **Default:** `null`
- **Validation:**
  - Max length: 255 characters
  - Free-form text (Turkish characters allowed)
  - Comma-separated roles recommended but not enforced
- **Purpose:**
  - Helps manager track employee capabilities
  - Used by AI scheduler to understand skill sets
  - Displayed in employee list/details
- **Examples:**
  - `"Kasiyer"` (single role)
  - `"Garson, Barista"` (multiple roles)
  - `"Aşçı Yardımcısı"` (Turkish characters OK)
  - `null` (not specified)

#### `max_weekly_hours` (NEW)
- **Type:** `number | null`
- **Required:** ❌ No (optional)
- **Default:** `null` (no limit)
- **Validation:**
  - Must be an integer (no decimals)
  - Minimum: `0` (zero allowed - means "on leave this week")
  - Maximum: `60` (enforced by API)
  - Backend validation: `max_weekly_hours >= 0 && max_weekly_hours <= 60`
- **Purpose:**
  - **Primary:** Used by AI scheduler as a soft limit
  - AI will try to respect this limit but may slightly exceed if necessary
  - Prevents over-scheduling employees
  - Useful for part-time workers or legal compliance
- **Examples:**
  - `20` → Part-time worker (4 hours/day × 5 days)
  - `40` → Full-time worker (8 hours/day × 5 days)
  - `0` → Employee on leave/inactive this week
  - `null` → No limit (AI decides based on availability)
- **Notes:**
  - This is a **soft limit** for AI, not a hard constraint
  - If manager sets it to 0, AI will not schedule this employee
  - If null, AI treats as unlimited (respects only shift preferences)

---

## Response

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "uuid",
      "username": "ahmet.yilmaz",
      "full_name": "Ahmet Yılmaz",
      "job_description": "Kasiyer, Garson",
      "max_weekly_hours": 40,
      "first_login": true,
      "status": "active",
      "manager_notes": null,
      "created_at": "2025-10-25T10:00:00Z",
      "last_login": null
    },
    "temp_password": "ShfA3bK9xY2"
  }
}
```

**Important Notes:**
- `temp_password` is only returned **once** during creation
- Manager must share this password with the employee
- Employee will be forced to change password on first login

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "success": false,
  "error": "full_name ve username alanları gereklidir"
}
```

#### 400 Bad Request - Invalid max_weekly_hours
```json
{
  "success": false,
  "error": "max_weekly_hours 0 ile 60 arasında olmalıdır"
}
```

#### 409 Conflict - Username Already Exists
```json
{
  "success": false,
  "error": "Bu kullanıcı adı zaten kullanılıyor"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Çalışan oluşturulurken bir hata oluştu"
}
```

---

## Frontend Integration Guide

### Example React Native Code

```typescript
import { addEmployee } from '@/services/employee';

const handleSubmit = async () => {
  try {
    const result = await addEmployee({
      full_name: form.fullName,
      username: form.username,
      job_description: form.jobDescription || null,
      max_weekly_hours: form.maxWeeklyHours ? parseInt(form.maxWeeklyHours) : null,
    });

    // Show success modal with temp_password
    showPasswordModal(result.temp_password);
  } catch (error) {
    Alert.alert('Hata', error.message);
  }
};
```

### Frontend Form Fields

**Field 1: İş Tanımı (Job Description)** - Optional
- Input type: Text
- Placeholder: `"Örn: Kasiyer, Garson"`
- Hint: `"Birden fazla rolü virgülle ayırarak yazabilirsiniz"`
- Validation: Max 255 characters

**Field 2: Maksimum Haftalık Saat (Max Weekly Hours)** - Optional
- Input type: Numeric
- Placeholder: `"Örn: 40"`
- Hint: `"Çalışanın haftada maksimum çalışabileceği saat (boş bırakılırsa sınır yok)"`
- Validation:
  - Must be integer
  - 0-60 range
  - Show warning if 0 ("Bu çalışan bu hafta çizelgeye dahil edilmeyecek")

---

## Database Schema Changes

### Migration Required

```sql
-- Add new columns to employees table
ALTER TABLE employees
ADD COLUMN job_description VARCHAR(255),
ADD COLUMN max_weekly_hours INTEGER CHECK (max_weekly_hours >= 0 AND max_weekly_hours <= 60);

COMMENT ON COLUMN employees.job_description IS 'Comma-separated job roles (e.g., "Cashier, Server")';
COMMENT ON COLUMN employees.max_weekly_hours IS 'Maximum hours per week (soft limit for AI scheduler). 0 = on leave, NULL = no limit';
```

---

## AI Scheduler Integration

### Llama Prompt Updates

When generating schedules, the AI prompt should include:

```
EMPLOYEE 1: Ahmet Yılmaz
Job Description: Kasiyer, Garson
Max Weekly Hours: 40
Availability: [slots...]

CONSTRAINTS:
- Try to keep total hours under max_weekly_hours
- If max_weekly_hours is 0, DO NOT schedule this employee
- If max_weekly_hours is null, no weekly limit
```

### AI Behavior

- **max_weekly_hours = null:** No constraint, schedule freely
- **max_weekly_hours = 0:** Skip this employee entirely
- **max_weekly_hours > 0:** Soft limit, AI will try to respect but may exceed slightly if needed

---

## Testing Checklist

### Backend Tests

- [ ] Create employee with job_description = "Kasiyer"
- [ ] Create employee with job_description = null
- [ ] Create employee with max_weekly_hours = 40
- [ ] Create employee with max_weekly_hours = 0
- [ ] Create employee with max_weekly_hours = null
- [ ] Reject max_weekly_hours = -1 (negative)
- [ ] Reject max_weekly_hours = 100 (over limit)
- [ ] Reject max_weekly_hours = 45.5 (decimal)

### Frontend Tests

- [ ] Form allows empty job_description
- [ ] Form allows empty max_weekly_hours
- [ ] Form shows warning when max_weekly_hours = 0
- [ ] Form rejects max_weekly_hours > 60
- [ ] Form shows character count for job_description
- [ ] Success modal displays temp_password correctly

### Integration Tests

- [ ] AI scheduler respects max_weekly_hours = 40
- [ ] AI scheduler skips employee with max_weekly_hours = 0
- [ ] AI scheduler works with max_weekly_hours = null

---

## Backward Compatibility

### Existing Employees

- Employees created before this update will have:
  - `job_description = null`
  - `max_weekly_hours = null`
- This is safe and expected

### Frontend Compatibility

- Old frontend (without these fields) will still work
- Backend will default missing fields to `null`

---

## Timeline

| Task | Owner | Status | ETA |
|------|-------|--------|-----|
| API Documentation | Backend | ✅ Done | Oct 25 |
| Database Migration | Backend | 🚧 Pending | Oct 25 |
| Backend Implementation | Backend | 🚧 Pending | Oct 25 |
| Frontend Form Fields | Frontend | 🚧 Pending | Oct 25 |
| Integration Testing | Both | ⏳ Not Started | Oct 26 |

---

## Questions?

Contact backend team or check `small_patch_roadmap.md` for implementation details.
