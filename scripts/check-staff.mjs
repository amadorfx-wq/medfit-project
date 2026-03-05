import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS for this diagnostic
);

async function checkStaff() {
    console.log('--- STAFF TABLE DIAGNOSTICS ---');
    const { data, error } = await supabase.from('staff').select('*').eq('email', 'admin@medfit.com');

    if (error) {
        console.error('ERROR:', error);
    } else {
        console.log('Staff Records Found:', data.length);
        if (data.length > 0) {
            console.log('Staff ID:', data[0].id);
            console.log('NDA Signed At:', data[0].nda_signed_at);
        }
    }
}

checkStaff();
