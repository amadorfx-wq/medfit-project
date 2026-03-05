import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testFetch() {
    console.log('--- RLS SELECT DIAGNOSTICS ---');

    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'admin@medfit.com',
        password: 'Password123!'
    });

    if (authErr) return console.error('Auth Error:', authErr.message);
    console.log('Logged in successfully.', authData.user.id);

    // Attempt standard fetch
    const { data, error } = await supabase.from('patients').select('*');
    console.log('Patients fetched natively (no context):', data?.length || 0);

    // Attempt to set config then fetch
    await supabase.rpc('set_config', {
        setting_name: 'app.tenant_id',
        setting_value: '6cd5dbf5-7cda-42ab-ba05-72648792cc4e', // MedFit America ID ? Wait, I will use a known one
        is_local: true
    });

    const { data: data2, error: err2 } = await supabase.from('patients').select('*');
    console.log('Patients fetched after RPC (is_local: true):', data2?.length || 0);
}

testFetch();
