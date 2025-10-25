-- Insert test manager into managers table
INSERT INTO managers (id, email, store_name, deadline_day)
VALUES ('03898803-dd32-4455-8adb-96d8e0853491', 'testmanager@shiffy.com', 'Test Store', 5)
ON CONFLICT (id) DO NOTHING;

-- Verify insertion
SELECT id, email, store_name, deadline_day FROM managers WHERE id = '03898803-dd32-4455-8adb-96d8e0853491';
