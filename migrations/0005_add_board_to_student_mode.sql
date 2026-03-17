-- Add 'BOARD' to student_mode enum (replaces BREAK)
ALTER TYPE student_mode ADD VALUE IF NOT EXISTS 'BOARD';
