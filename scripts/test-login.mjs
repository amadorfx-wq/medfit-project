import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLogin() {
    console.log('--- LOGIN TEST ---');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@medfit.com',
        password: 'MedFit-Production-2026!'
    });

    if (error) {
        console.error('ERROR:', error.message);
    } else {
        console.log('SUCCESS!');
        console.log('User ID:', data.user.id);
        console.log('Role:', data.user.user_metadata.role);
    }
}

testLogin();
