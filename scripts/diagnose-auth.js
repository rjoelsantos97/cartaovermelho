#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Diagnosing Supabase Authentication Setup...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}\n`);

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

// Create clients
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userClient = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseAuth() {
  try {
    // Test 1: Check if Supabase is running
    console.log('🔍 Test 1: Checking Supabase connection...');
    const { data: health, error: healthError } = await adminClient
      .from('original_articles')
      .select('id')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Supabase connection failed:', healthError.message);
      console.log('💡 Make sure Supabase is running: npx supabase start');
      return;
    }
    console.log('✅ Supabase connection successful\n');

    // Test 2: Check auth service
    console.log('🔍 Test 2: Checking auth service...');
    const { data: session, error: sessionError } = await userClient.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Auth service error:', sessionError.message);
    } else {
      console.log('✅ Auth service accessible');
      console.log(`📄 Current session: ${session.session ? 'Active' : 'None'}\n`);
    }

    // Test 3: List existing users
    console.log('🔍 Test 3: Checking existing users...');
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Failed to list users:', usersError.message);
    } else {
      console.log(`👥 Total users: ${users.users.length}`);
      users.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id})`);
      });
      console.log();
    }

    // Test 4: Check for admin user
    console.log('🔍 Test 4: Checking for admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cartaovermelho.pt';
    const { data: adminUser, error: adminError } = await adminClient.auth.admin.getUserByEmail(adminEmail);
    
    if (adminError || !adminUser) {
      console.log('❌ Admin user not found, creating...');
      await createAdminUser();
    } else {
      console.log('✅ Admin user exists:');
      console.log(`   📧 Email: ${adminUser.email}`);
      console.log(`   🆔 ID: ${adminUser.id}`);
      console.log(`   ✅ Email confirmed: ${adminUser.email_confirmed_at ? 'Yes' : 'No'}`);
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cartaovermelho.pt';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    const { data: user, error } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Admin User'
      }
    });

    if (error) {
      console.error('❌ Failed to create admin user:', error.message);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🆔 ID: ${user.id}`);
    console.log(`   🔑 Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run diagnosis
diagnoseAuth().then(() => {
  console.log('\n🎉 Diagnosis complete!');
  console.log('🌐 Try logging in at: http://localhost:3000/admin/login');
  console.log('📧 Email: admin@cartaovermelho.pt');
  console.log('🔑 Password: admin123');
}).catch((error) => {
  console.error('❌ Diagnosis script failed:', error);
  process.exit(1);
});