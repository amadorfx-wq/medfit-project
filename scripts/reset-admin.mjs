import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceResetPassword() {
    console.log('--- PASSWORD RESET DIAGNOSTICS ---');

    // 1. Get the exact user ID for admin@medfit.com
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
        console.error('Error fetching users:', usersError.message);
        return;
    }

    const adminUser = usersData.users.find(u => u.email === 'admin@medfit.com');

    if (!adminUser) {
        console.error('CRITICAL: admin@medfit.com not found in Auth system!');
        return;
    }

    console.log(`Found Admin User. ID: ${adminUser.id}`);

    // 2. Force update the password to a fresh one
    const newPassword = 'Password123!';

    const { data, error } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: newPassword }
    );

    if (error) {
        console.error('Failed to reset password:', error.message);
    } else {
        console.log('✅ Password successfully forced to:', newPassword);
        console.log('✅ User Meta:', data.user.user_metadata);
    }
}

forceResetPassword();
