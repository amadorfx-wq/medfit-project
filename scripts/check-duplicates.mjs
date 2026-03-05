import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS and see all records
);

async function checkDuplicates() {
    console.log('--- PATIENT DUPLICATES CHECK ---');
    const { data, error } = await supabase.from('patients').select('id, name, email, created_at').order('created_at', { ascending: false });

    if (error) {
        console.error('ERROR:', error);
    } else {
        const thomCount = data.filter(p => p.name.includes("Thom")).length;
        console.log(`Total Patients in DB: ${data.length}`);
        console.log(`Total 'Thom' records in DB: ${thomCount}`);
        console.log('Last 10 records:');
        console.table(data.slice(0, 10));
    }
}

checkDuplicates();
