-- 0003_alter_students_add_fullname_break.sql
-- Adds 'break' to student_mode enum and a new column full_name on students

begin;

-- Add new enum value for student_mode
alter type public.student_mode add value if not exists 'break';

-- Add new column full_name to students (nullable for safe rollout)
alter table public.students add column if not exists full_name text;

-- Backfill full_name from existing name values
update public.students
set full_name = name
where (full_name is null or full_name = '') and name is not null;

commit;


