-- Add email verification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;

-- Mark existing users as verified (they already signed up)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL OR email_verified = FALSE;
