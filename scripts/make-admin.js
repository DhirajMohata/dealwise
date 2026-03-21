require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log('Error: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const s = createClient(url, key);

const email = process.argv[2];
if (!email) {
  console.log('Usage: node scripts/make-admin.js <email>');
  process.exit(1);
}

async function run() {
  const { error } = await s.from('credits').upsert({
    email,
    credits: 999999,
    total_used: 0,
    plan: 'admin',
    created_at: new Date().toISOString(),
  });

  if (error) console.log('Error:', error.message);
  else console.log('\u2705', email, 'is now admin with unlimited credits');
}
run();
