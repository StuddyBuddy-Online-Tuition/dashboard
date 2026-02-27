-- Add ticketid, icnumber, recurringpayment, recurringpaymentdate to students
-- Run after 0003_alter_students_add_fullname_break

ALTER TABLE students ADD COLUMN IF NOT EXISTS ticketid VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS icnumber VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS recurringpayment BOOLEAN;
ALTER TABLE students ADD COLUMN IF NOT EXISTS recurringpaymentdate DATE;
