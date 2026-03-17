-- Add password column to users table
-- Run after 001_initial_schema.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
