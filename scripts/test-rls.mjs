import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUpdate() {
    console.log('--- RLS UPDATE DIAGNOSTICS ---');

    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'admin@medfit.com',
        password: 'Password123!'
    });

    if (authErr) return console.error('Auth Error:', authErr.message);

    console.log('Logged in successfully.', authData.user.id);

    // Now try to update the staff table
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('staff')
        .update({ nda_signed_at: now })
        .eq('id', 'staff_acee9994')
        .select();

    if (error) {
        console.error('Update Error:', error);
    } else {
        console.log('Update Result:', data);
    }
}

testUpdate();
