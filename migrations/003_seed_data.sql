-- Seed Data for StudyBuddy Dashboard
-- Run after: 001, 001_add_users_password, 0003, 0004, 002
-- Creates sample students, subject enrollments, and timeslots

-- =============================================================================
-- 1. SAMPLE STUDENTS
-- =============================================================================
INSERT INTO students (
  id, studentId, name, full_name, parentName, studentPhone, parentPhone, email,
  school, grade, status, classInId, registeredDate, modes, dlp, ticketid, icnumber,
  recurringpayment, recurringpaymentdate
) VALUES
-- Active student
(
  'a1111111-1111-1111-1111-111111111101',
  'STU001',
  'Ahmad bin Abdullah',
  'Ahmad bin Abdullah',
  'Abdullah Rahman',
  '0123456789',
  '0198765432',
  'ahmad@example.com',
  'SMK Example',
  'F4',
  'active',
  NULL,
  '2024-01-15',
  ARRAY['NORMAL', '1 TO 1']::student_mode[],
  'DLP',
  NULL,
  NULL,
  true,
  '2025-01-15'
),
-- Pending student (with ticket)
(
  'a1111111-1111-1111-1111-111111111102',
  'STU002',
  'Siti Nurhaliza',
  'Siti Nurhaliza',
  'Haliza Ibrahim',
  '0123456788',
  '0198765433',
  'siti@example.com',
  'SMK Demo',
  'F5',
  'pending',
  NULL,
  '2025-02-01',
  ARRAY['NORMAL']::student_mode[],
  'non-DLP',
  'TKT-2025-001',
  NULL,
  NULL,
  NULL
),
-- Trial student
(
  'a1111111-1111-1111-1111-111111111103',
  'STU003',
  'Muhammad Farhan',
  'Muhammad Farhan',
  'Farhan Osman',
  '0123456787',
  '0198765434',
  'farhan@example.com',
  'SMK Sample',
  'F3',
  'trial',
  NULL,
  '2025-02-10',
  ARRAY['1 TO 1']::student_mode[],
  'DLP',
  'TKT-2025-002',
  '030101010101',
  false,
  NULL
),
-- Inactive student
(
  'a1111111-1111-1111-1111-111111111104',
  'STU004',
  'Nurul Izzati',
  'Nurul Izzati',
  'Izzati Ahmad',
  '0123456786',
  NULL,
  'nurul@example.com',
  'SMK Test',
  'S5',
  'inactive',
  NULL,
  '2023-06-01',
  ARRAY['NORMAL']::student_mode[],
  'non-DLP',
  NULL,
  NULL,
  NULL,
  NULL
),
-- Another active student
(
  'a1111111-1111-1111-1111-111111111105',
  'STU005',
  'Lee Wei Ming',
  'Lee Wei Ming',
  'Lee Cheng Ho',
  '0161234567',
  '0169876543',
  'weiming@example.com',
  'SMK Bandar',
  'F5',
  'active',
  NULL,
  '2024-03-20',
  ARRAY['NORMAL']::student_mode[],
  'DLP',
  NULL,
  NULL,
  true,
  '2025-03-20'
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. STUDENT-SUBJECT ENROLLMENTS (student_subjects)
-- =============================================================================
INSERT INTO student_subjects (studentId, subjectCode) VALUES
-- Ahmad: Chemistry F4, Add Math F4
('a1111111-1111-1111-1111-111111111101', 'K2F4'),
('a1111111-1111-1111-1111-111111111101', 'AMDF4'),
-- Siti: Biology F5, Physics F5
('a1111111-1111-1111-1111-111111111102', 'B2F5'),
('a1111111-1111-1111-1111-111111111102', 'F2F5'),
-- Farhan: Math F3, Science F3
('a1111111-1111-1111-1111-111111111103', 'MMDF3'),
('a1111111-1111-1111-1111-111111111103', 'S2F3'),
-- Nurul: Sejarah F5
('a1111111-1111-1111-1111-111111111104', 'SEJF5'),
-- Lee: Add Math F5, Physics F5, Kimia F5
('a1111111-1111-1111-1111-111111111105', 'AMDF5'),
('a1111111-1111-1111-1111-111111111105', 'F2F5'),
('a1111111-1111-1111-1111-111111111105', 'K2F5')
ON CONFLICT (studentId, subjectCode) DO NOTHING;

-- =============================================================================
-- 3. SAMPLE TIMESLOTS (master schedule - no student assigned)
-- =============================================================================
INSERT INTO timeslots (subjectCode, day, startTime, endTime, teacherName, studentId, studentName) VALUES
-- Kimia DLP F4 - Monday & Wednesday
('K2F4', 'Monday', '14:00', '15:30', 'Cikgu Aminah', NULL, NULL),
('K2F4', 'Wednesday', '14:00', '15:30', 'Cikgu Aminah', NULL, NULL),
-- Add Math DLP F4 - Tuesday & Thursday
('AMDF4', 'Tuesday', '15:00', '16:30', 'Mr Tan', NULL, NULL),
('AMDF4', 'Thursday', '15:00', '16:30', 'Mr Tan', NULL, NULL),
-- Biology DLP F5 - Friday
('B2F5', 'Friday', '10:00', '11:30', 'Dr Siti', NULL, NULL),
-- Assigned slot: Ahmad in Kimia
('K2F4', 'Monday', '14:00', '15:30', 'Cikgu Aminah', 'a1111111-1111-1111-1111-111111111101', 'Ahmad bin Abdullah');

-- Verify
SELECT 'Students' AS table_name, COUNT(*) AS count FROM students
UNION ALL
SELECT 'Student enrollments', COUNT(*) FROM student_subjects
UNION ALL
SELECT 'Timeslots', COUNT(*) FROM timeslots;
