-- Sort Verification Seed - Actual data from bug report
-- Run after 003_seed_data.sql
-- Verifies: Ahmad Wazhif (SB260159, reg 2026-02) should appear FIRST (newest)
--           Isabel & Afrina (SB250xxx, reg 2025) should appear below

INSERT INTO students (
  id, studentId, name, full_name, parentName, studentPhone, parentPhone, email,
  school, grade, status, classInId, registeredDate, modes, dlp, ticketid, icnumber,
  recurringpayment, recurringpaymentdate
) VALUES
-- Isabel Fonte Arasu - registered 2025-06 (older)
(
  'b2222222-2222-2222-2222-222222222201',
  'SB250235',
  'Isabel Fonte Arasu',
  'Isabel Fonte Arasu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Asia Pacific School',
  'S6',
  'active',
  'balan1983a@gmail.com',
  '2025-06-15',
  ARRAY['1 TO 1']::student_mode[],
  'DLP',
  NULL,
  NULL,
  NULL,
  NULL
),
-- Afrina Juita - registered 2025-05 (older)
(
  'b2222222-2222-2222-2222-222222222202',
  'SB250234',
  'Afrina Juita',
  'Afrina Juita',
  NULL,
  NULL,
  NULL,
  NULL,
  'Little Caliph',
  'S1',
  'active',
  '+60 192809578',
  '2025-05-10',
  ARRAY['1 TO 1']::student_mode[],
  'non-DLP',
  NULL,
  NULL,
  NULL,
  NULL
),
-- Ahmad Wazhif - registered 2026-02 (NEWEST - should appear first after fix)
(
  'b2222222-2222-2222-2222-222222222203',
  'SB260159',
  'Ahmad Wazhif',
  'Ahmad Wazhif',
  NULL,
  '0193122336',
  NULL,
  NULL,
  'SMK SULAIMAN',
  'F2',
  'active',
  'PENDING CLASSIN',
  '2026-02-15',
  ARRAY['NORMAL']::student_mode[],
  'non-DLP',
  NULL,
  NULL,
  NULL,
  NULL
)
ON CONFLICT (studentid) DO UPDATE SET
  registereddate = EXCLUDED.registereddate,
  "updatedAt" = NOW();

-- Enrollments
INSERT INTO student_subjects (studentId, subjectCode) VALUES
('b2222222-2222-2222-2222-222222222201', 'BMS6 1:1'),
('b2222222-2222-2222-2222-222222222202', 'MMS1 1:1'),
('b2222222-2222-2222-2222-222222222203', 'MMF2'),
('b2222222-2222-2222-2222-222222222203', 'S1F2')
ON CONFLICT (studentId, subjectCode) DO NOTHING;
