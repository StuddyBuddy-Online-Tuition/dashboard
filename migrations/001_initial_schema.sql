-- StudyBuddy Dashboard Database Schema
-- Migration: 001_initial_schema
-- Created: 2025-10-04

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE student_status AS ENUM ('active', 'pending', 'inactive', 'trial', 'removed');
CREATE TYPE student_mode AS ENUM ('1 TO 1', 'NORMAL', 'OTHERS');
CREATE TYPE dlp_status AS ENUM ('DLP', 'non-DLP');
CREATE TYPE weekday AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    standard VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studentId VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    parentName VARCHAR(255),
    studentPhone VARCHAR(50),
    parentPhone VARCHAR(50),
    email VARCHAR(255),
    school VARCHAR(255),
    grade VARCHAR(10),
    status student_status NOT NULL,
    classInId VARCHAR(255),
    registeredDate DATE,
    modes student_mode[] DEFAULT '{}',
    dlp dlp_status NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student_Subjects junction table (many-to-many relationship)
CREATE TABLE student_subjects (
    studentId UUID NOT NULL,
    subjectCode VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (studentId, subjectCode),
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subjectCode) REFERENCES subjects(code) ON DELETE CASCADE
);

-- Timeslots table
CREATE TABLE timeslots (
    timeslotId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subjectCode VARCHAR(50) NOT NULL,
    day weekday NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    teacherName VARCHAR(255) NOT NULL,
    studentId UUID,
    studentName VARCHAR(255),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (subjectCode) REFERENCES subjects(code) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_subjects_standard ON subjects(standard);
CREATE INDEX idx_subjects_type ON subjects(type);

CREATE INDEX idx_students_studentId ON students(studentId);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_school ON students(school);
CREATE INDEX idx_students_grade ON students(grade);
CREATE INDEX idx_students_dlp ON students(dlp);

CREATE INDEX idx_student_subjects_studentId ON student_subjects(studentId);
CREATE INDEX idx_student_subjects_subjectCode ON student_subjects(subjectCode);

CREATE INDEX idx_timeslots_subjectCode ON timeslots(subjectCode);
CREATE INDEX idx_timeslots_day ON timeslots(day);
CREATE INDEX idx_timeslots_studentId ON timeslots(studentId);
CREATE INDEX idx_timeslots_teacherName ON timeslots(teacherName);

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updatedAt
CREATE TRIGGER update_users_updatedAt BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updatedAt BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updatedAt BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_subjects_updatedAt BEFORE UPDATE ON student_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timeslots_updatedAt BEFORE UPDATE ON timeslots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'System users (admin and staff)';
COMMENT ON TABLE subjects IS 'Master list of all available subjects';
COMMENT ON TABLE students IS 'Student information and enrollment data';
COMMENT ON TABLE student_subjects IS 'Many-to-many relationship between students and subjects';
COMMENT ON TABLE timeslots IS 'Class scheduling and time slot assignments';

COMMENT ON COLUMN students.studentId IS 'Internal school identifier';
COMMENT ON COLUMN students.classInId IS 'ClassIn platform identifier';
COMMENT ON COLUMN timeslots.studentId IS 'NULL for master schedule slots, populated for assigned slots';
