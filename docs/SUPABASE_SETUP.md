# Supabase Initialization Guide

Run these steps in order in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).

## 1. App schema and tables

Run each migration file in order:

1. **`migrations/001_initial_schema.sql`** – Base tables (users, subjects, students, timeslots, etc.)
2. **`migrations/001_add_users_password.sql`** – Adds `password` column to `users`
3. **`migrations/0003_alter_students_add_fullname_break.sql.sql`** – Student `full_name` and `break` mode
4. **`migrations/0004_add_students_ticketid_etc.sql`** – Student `ticketid`, `icnumber`, `recurringpayment`, `recurringpaymentdate`
4b. **`migrations/0005_add_board_to_student_mode.sql`** – Add `BOARD` to student_mode enum
5. **`migrations/002_seed_subjects.sql`** – Seed subjects
6. **`migrations/003_seed_data.sql`** – Sample students, enrollments, timeslots (or run `npm run seed`)
7. **`migrations/004_seed_sort_verification.sql`** – Isabel, Afrina, Ahmad for sort verification (included in `npm run seed`)

## 2. NextAuth schema (for Supabase adapter)

Copy and run this in the SQL Editor:

```sql
CREATE SCHEMA IF NOT EXISTS next_auth;

GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON SCHEMA next_auth TO postgres;

CREATE TABLE IF NOT EXISTS next_auth.users (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text,
    email text,
    "emailVerified" timestamp with time zone,
    image text,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);

GRANT ALL ON TABLE next_auth.users TO postgres;
GRANT ALL ON TABLE next_auth.users TO service_role;

CREATE TABLE IF NOT EXISTS next_auth.sessions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    expires timestamp with time zone NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" uuid,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessionToken_unique UNIQUE ("sessionToken"),
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES next_auth.users (id) ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.sessions TO postgres;
GRANT ALL ON TABLE next_auth.sessions TO service_role;

CREATE TABLE IF NOT EXISTS next_auth.accounts (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at bigint,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    oauth_token_secret text,
    oauth_token text,
    "userId" uuid,
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT provider_unique UNIQUE (provider, "providerAccountId"),
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES next_auth.users (id) ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.accounts TO postgres;
GRANT ALL ON TABLE next_auth.accounts TO service_role;

CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
    identifier text,
    token text,
    expires timestamp with time zone NOT NULL,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_unique UNIQUE (token),
    CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;
GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;
```

## 3. Expose NextAuth schema

In Supabase Dashboard → **Settings** → **API** → **Exposed schemas**, add `next_auth`.

## 4. Create your first user

Either use the **dev bypass** (if `APP_ENV=development` in `.env`):

- Email: `test@email.com`
- Password: `1234`

Or create a real user with the script:

```bash
# Edit scripts/create-user.mjs with your email, password, and name, then:
node scripts/create-user.mjs
```

Or insert manually in the SQL Editor (get hash first):

```bash
node -e "console.log(require('bcrypt').hashSync('YourPassword123', 10))"
```

```sql
INSERT INTO users (name, email, role, password)
VALUES ('Your Name', 'your@email.com', 'admin', '<paste-hash-here>');
```
