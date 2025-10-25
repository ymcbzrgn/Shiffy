-- ============================================================================
-- MOCK DATA SEED SCRIPT
-- ============================================================================
-- Purpose: Insert test data for all tables for development/testing
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Mock Supabase Auth Users for Managers
-- ============================================================================
-- Note: Supabase Auth users need to be created via auth.users
-- We'll insert directly with mock UUIDs (bypassing actual auth)

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES
  -- Manager 1: Ahmet Yılmaz (Starbucks)
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ahmet.yilmaz@starbucks.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', -- Mock bcrypt hash
    NOW(),
    NOW(),
    NOW(),
    '',
    ''
  ),
  -- Manager 2: Zeynep Kaya (Burger King)
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'zeynep.kaya@burgerking.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
    NOW(),
    NOW(),
    NOW(),
    '',
    ''
  ),
  -- Manager 3: Mehmet Demir (McDonald's)
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mehmet.demir@mcdonalds.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
    NOW(),
    NOW(),
    NOW(),
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Insert Managers
-- ============================================================================

INSERT INTO managers (id, email, store_name, deadline_day) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ahmet.yilmaz@starbucks.com', 'Starbucks Kadıköy', 5),
  ('22222222-2222-2222-2222-222222222222', 'zeynep.kaya@burgerking.com', 'Burger King Beyoğlu', 3),
  ('33333333-3333-3333-3333-333333333333', 'mehmet.demir@mcdonalds.com', 'McDonald''s Şişli', 7)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 3: Insert Employees
-- ============================================================================
-- Password for all: "TestPass123" (hash: $2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO)

INSERT INTO employees (
  id,
  manager_id,
  username,
  full_name,
  password_hash,
  first_login,
  manager_notes,
  status
) VALUES
  -- Starbucks Employees (Manager: Ahmet)
  (
    'e1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'can.ozturk',
    'Can Öztürk',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    false, -- Already changed password
    'Çok güvenilir, sabah vardiyalarını seviyor',
    'active'
  ),
  (
    'e1111111-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'ayse.sahin',
    'Ayşe Şahin',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    true, -- First login (needs to change password)
    'Yeni başladı, eğitim aşamasında',
    'active'
  ),
  (
    'e1111111-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'emre.yilmaz',
    'Emre Yılmaz',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    false,
    'Barista uzmanı, müşteri memnuniyeti yüksek',
    'active'
  ),

  -- Burger King Employees (Manager: Zeynep)
  (
    'e2222222-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'berat.kara',
    'Berat Kara',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    false,
    'Hızlı çalışıyor, yoğun saatlerde tercih edilir',
    'active'
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'elif.celik',
    'Elif Çelik',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    true,
    NULL,
    'active'
  ),
  (
    'e2222222-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'selin.arslan',
    'Selin Arslan',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    false,
    'Part-time öğrenci, hafta sonları müsait',
    'active'
  ),

  -- McDonald's Employees (Manager: Mehmet)
  (
    'e3333333-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'deniz.korkmaz',
    'Deniz Korkmaz',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    false,
    'Shift lideri, sorumlu',
    'active'
  ),
  (
    'e3333333-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'burak.ozdemir',
    'Burak Özdemir',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    true,
    'Yeni işe alındı',
    'active'
  ),
  (
    'e3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'irem.yavuz',
    'İrem Yavuz',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    false,
    'Kasada çok başarılı',
    'active'
  ),

  -- Inactive Employee (for testing)
  (
    'e9999999-9999-9999-9999-999999999999',
    '11111111-1111-1111-1111-111111111111',
    'ahmet.test',
    'Ahmet Test (Inactive)',
    '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    false,
    'Test için pasif kullanıcı',
    'inactive'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: Insert Shift Preferences
-- ============================================================================

INSERT INTO shift_preferences (
  id,
  employee_id,
  week_start_date,
  slots,
  submitted_at
) VALUES
  -- Can Öztürk (Starbucks) - Week 1
  (
    'p1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    '2025-10-27', -- Monday of this week
    '[
      {"day": "Monday", "time": "morning", "status": "available"},
      {"day": "Monday", "time": "afternoon", "status": "preferred"},
      {"day": "Monday", "time": "evening", "status": "unavailable"},
      {"day": "Tuesday", "time": "morning", "status": "preferred"},
      {"day": "Tuesday", "time": "afternoon", "status": "available"},
      {"day": "Tuesday", "time": "evening", "status": "unavailable"},
      {"day": "Wednesday", "time": "morning", "status": "preferred"},
      {"day": "Wednesday", "time": "afternoon", "status": "available"},
      {"day": "Wednesday", "time": "evening", "status": "unavailable"},
      {"day": "Thursday", "time": "morning", "status": "available"},
      {"day": "Thursday", "time": "afternoon", "status": "available"},
      {"day": "Thursday", "time": "evening", "status": "preferred"},
      {"day": "Friday", "time": "morning", "status": "unavailable"},
      {"day": "Friday", "time": "afternoon", "status": "unavailable"},
      {"day": "Friday", "time": "evening", "status": "unavailable"},
      {"day": "Saturday", "time": "morning", "status": "available"},
      {"day": "Saturday", "time": "afternoon", "status": "preferred"},
      {"day": "Saturday", "time": "evening", "status": "available"},
      {"day": "Sunday", "time": "morning", "status": "unavailable"},
      {"day": "Sunday", "time": "afternoon", "status": "available"},
      {"day": "Sunday", "time": "evening", "status": "available"}
    ]'::jsonb,
    NOW() - INTERVAL '2 days'
  ),

  -- Emre Yılmaz (Starbucks) - Week 1
  (
    'p1111111-3333-3333-3333-333333333333',
    'e1111111-3333-3333-3333-333333333333',
    '2025-10-27',
    '[
      {"day": "Monday", "time": "morning", "status": "unavailable"},
      {"day": "Monday", "time": "afternoon", "status": "available"},
      {"day": "Monday", "time": "evening", "status": "preferred"},
      {"day": "Tuesday", "time": "morning", "status": "unavailable"},
      {"day": "Tuesday", "time": "afternoon", "status": "preferred"},
      {"day": "Tuesday", "time": "evening", "status": "available"},
      {"day": "Wednesday", "time": "morning", "status": "available"},
      {"day": "Wednesday", "time": "afternoon", "status": "preferred"},
      {"day": "Wednesday", "time": "evening", "status": "available"},
      {"day": "Thursday", "time": "morning", "status": "unavailable"},
      {"day": "Thursday", "time": "afternoon", "status": "unavailable"},
      {"day": "Thursday", "time": "evening", "status": "unavailable"},
      {"day": "Friday", "time": "morning", "status": "preferred"},
      {"day": "Friday", "time": "afternoon", "status": "available"},
      {"day": "Friday", "time": "evening", "status": "preferred"},
      {"day": "Saturday", "time": "morning", "status": "available"},
      {"day": "Saturday", "time": "afternoon", "status": "available"},
      {"day": "Saturday", "time": "evening", "status": "preferred"},
      {"day": "Sunday", "time": "morning", "status": "preferred"},
      {"day": "Sunday", "time": "afternoon", "status": "preferred"},
      {"day": "Sunday", "time": "evening", "status": "unavailable"}
    ]'::jsonb,
    NOW() - INTERVAL '1 day'
  ),

  -- Berat Kara (Burger King) - Week 1
  (
    'p2222222-1111-1111-1111-111111111111',
    'e2222222-1111-1111-1111-111111111111',
    '2025-10-27',
    '[
      {"day": "Monday", "time": "morning", "status": "available"},
      {"day": "Monday", "time": "afternoon", "status": "available"},
      {"day": "Monday", "time": "evening", "status": "available"},
      {"day": "Tuesday", "time": "morning", "status": "preferred"},
      {"day": "Tuesday", "time": "afternoon", "status": "preferred"},
      {"day": "Tuesday", "time": "evening", "status": "available"},
      {"day": "Wednesday", "time": "morning", "status": "preferred"},
      {"day": "Wednesday", "time": "afternoon", "status": "preferred"},
      {"day": "Wednesday", "time": "evening", "status": "available"},
      {"day": "Thursday", "time": "morning", "status": "available"},
      {"day": "Thursday", "time": "afternoon", "status": "available"},
      {"day": "Thursday", "time": "evening", "status": "available"},
      {"day": "Friday", "time": "morning", "status": "unavailable"},
      {"day": "Friday", "time": "afternoon", "status": "unavailable"},
      {"day": "Friday", "time": "evening", "status": "unavailable"},
      {"day": "Saturday", "time": "morning", "status": "available"},
      {"day": "Saturday", "time": "afternoon", "status": "available"},
      {"day": "Saturday", "time": "evening", "status": "preferred"},
      {"day": "Sunday", "time": "morning", "status": "available"},
      {"day": "Sunday", "time": "afternoon", "status": "preferred"},
      {"day": "Sunday", "time": "evening", "status": "available"}
    ]'::jsonb,
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 5: Insert Schedules (AI-generated mock)
-- ============================================================================

INSERT INTO schedules (
  id,
  manager_id,
  week_start_date,
  status,
  shifts,
  ai_summary,
  approved_at
) VALUES
  -- Starbucks Schedule - Approved
  (
    's1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '2025-10-20', -- Last week
    'approved',
    '[
      {
        "day": "Monday",
        "date": "2025-10-20",
        "shifts": [
          {
            "time": "morning",
            "employee_id": "e1111111-1111-1111-1111-111111111111",
            "employee_name": "Can Öztürk",
            "hours": "08:00-14:00"
          },
          {
            "time": "afternoon",
            "employee_id": "e1111111-3333-3333-3333-333333333333",
            "employee_name": "Emre Yılmaz",
            "hours": "14:00-20:00"
          }
        ]
      },
      {
        "day": "Tuesday",
        "date": "2025-10-21",
        "shifts": [
          {
            "time": "morning",
            "employee_id": "e1111111-1111-1111-1111-111111111111",
            "employee_name": "Can Öztürk",
            "hours": "08:00-14:00"
          },
          {
            "time": "evening",
            "employee_id": "e1111111-3333-3333-3333-333333333333",
            "employee_name": "Emre Yılmaz",
            "hours": "16:00-22:00"
          }
        ]
      },
      {
        "day": "Wednesday",
        "date": "2025-10-22",
        "shifts": [
          {
            "time": "morning",
            "employee_id": "e1111111-1111-1111-1111-111111111111",
            "employee_name": "Can Öztürk",
            "hours": "08:00-14:00"
          },
          {
            "time": "afternoon",
            "employee_id": "e1111111-3333-3333-3333-333333333333",
            "employee_name": "Emre Yılmaz",
            "hours": "14:00-20:00"
          }
        ]
      },
      {
        "day": "Saturday",
        "date": "2025-10-25",
        "shifts": [
          {
            "time": "afternoon",
            "employee_id": "e1111111-1111-1111-1111-111111111111",
            "employee_name": "Can Öztürk",
            "hours": "12:00-18:00"
          },
          {
            "time": "evening",
            "employee_id": "e1111111-3333-3333-3333-333333333333",
            "employee_name": "Emre Yılmaz",
            "hours": "18:00-22:00"
          }
        ]
      }
    ]'::jsonb,
    '{
      "total_shifts": 8,
      "coverage_rate": "85%",
      "employee_satisfaction": "High",
      "notes": "Geçen hafta çalışanların tercihleri %90 oranında karşılandı"
    }'::jsonb,
    NOW() - INTERVAL '5 days'
  ),

  -- Burger King Schedule - Pending
  (
    's2222222-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '2025-10-27', -- This week
    'pending',
    '[
      {
        "day": "Monday",
        "date": "2025-10-27",
        "shifts": [
          {
            "time": "morning",
            "employee_id": "e2222222-1111-1111-1111-111111111111",
            "employee_name": "Berat Kara",
            "hours": "08:00-14:00"
          },
          {
            "time": "afternoon",
            "employee_id": "e2222222-3333-3333-3333-333333333333",
            "employee_name": "Selin Arslan",
            "hours": "14:00-20:00"
          }
        ]
      },
      {
        "day": "Tuesday",
        "date": "2025-10-28",
        "shifts": [
          {
            "time": "morning",
            "employee_id": "e2222222-1111-1111-1111-111111111111",
            "employee_name": "Berat Kara",
            "hours": "08:00-14:00"
          },
          {
            "time": "evening",
            "employee_id": "e2222222-3333-3333-3333-333333333333",
            "employee_name": "Selin Arslan",
            "hours": "16:00-22:00"
          }
        ]
      }
    ]'::jsonb,
    '{
      "total_shifts": 4,
      "coverage_rate": "70%",
      "employee_satisfaction": "Medium",
      "notes": "AI tarafından oluşturuldu, onay bekliyor"
    }'::jsonb,
    NULL -- Not approved yet
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check inserted data
SELECT 'Managers' as table_name, COUNT(*) as count FROM managers
UNION ALL
SELECT 'Employees', COUNT(*) FROM employees
UNION ALL
SELECT 'Shift Preferences', COUNT(*) FROM shift_preferences
UNION ALL
SELECT 'Schedules', COUNT(*) FROM schedules;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Mock data seeded successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - 3 Managers (Starbucks, Burger King, McDonald''s)';
  RAISE NOTICE '   - 10 Employees (9 active, 1 inactive)';
  RAISE NOTICE '   - 3 Shift Preferences (this week)';
  RAISE NOTICE '   - 2 Schedules (1 approved, 1 pending)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Test Credentials:';
  RAISE NOTICE '   Username: can.ozturk (or any employee username)';
  RAISE NOTICE '   Password: TestPass123';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Try login:';
  RAISE NOTICE '   curl -X POST http://localhost:3000/api/employee/login \';
  RAISE NOTICE '     -H "Content-Type: application/json" \';
  RAISE NOTICE '     -d ''{"username":"can.ozturk","password":"TestPass123"}''';
END $$;
