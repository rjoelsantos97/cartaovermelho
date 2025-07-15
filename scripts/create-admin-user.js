#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cartaovermelho.pt';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  console.log('🚀 Creating admin user...');
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);

  try {
    // Create user using admin API
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Admin User'
      }
    });

    if (error) {
      console.error('❌ Error creating admin user:', error.message);
      
      // Try to get existing user
      const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(adminEmail);
      
      if (existingUser && !getUserError) {
        console.log('✅ Admin user already exists!');
        console.log('👤 User ID:', existingUser.id);
        console.log('📧 Email:', existingUser.email);
        return;
      }
      
      throw error;
    }

    console.log('✅ Admin user created successfully!');
    console.log('👤 User ID:', user.id);
    console.log('📧 Email:', user.email);
    console.log('🔑 Role:', user.user_metadata?.role || 'admin');

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser().then(() => {
  console.log('\n🎉 Admin user setup complete!');
  console.log('🌐 You can now login at: http://localhost:3000/admin/login');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});