import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdmin() {
    console.log('--- DB DIAGNOSTICS ---');
    // Check Tenant
    const { data: tenant } = await supabase.from('tenants').select('*').eq('slug', 'medfit-america').single();
    console.log('Default Tenant:', tenant ? 'FOUND' : 'NOT FOUND');

    // Get all users
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
        console.error('Error fetching users:', usersError.message);
        return;
    }

    const { users } = usersData;
    console.log(`\nFound ${users.length} users in Auth:`);
    users.forEach(u => {
        console.log(`- ${u.email} | Role: ${u.user_metadata?.role || 'NONE'}`);
    });

    // Check Staff table
    const { data: staff } = await supabase.from('staff').select('id, email, role, tenant_id');
    console.log('\nStaff Table:');
    console.log(staff);
}

checkAdmin();
