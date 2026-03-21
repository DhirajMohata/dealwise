# Supabase Database Setup

## Step 1: Run the migration

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"
5. Paste the contents of `supabase/migration.sql`
6. Click "Run"
7. You should see "Success. No rows returned" for each statement

## Step 2: Verify tables

Go to Table Editor in the sidebar. You should see:
- users
- credits
- analyses
- admin_settings
- contract_versions

## Step 3: Done!

The app will now use Supabase for data storage instead of SQLite/JSON files.
