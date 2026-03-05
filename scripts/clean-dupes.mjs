import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS and see all records
);

async function cleanDuplicates() {
    console.log('--- PATIENT DUPLICATES CLEANUP ---');
    const { data: allPatients, error: countError } = await supabase.from('patients').select('id, name, email, created_at').order('created_at', { ascending: false });

    if (countError) {
        console.error('ERROR:', countError);
        return;
    }

    // Group by exact lowercase email
    const emailsMap = new Map();
    for (const p of allPatients) {
        const mail = p.email.toLowerCase();
        if (!emailsMap.has(mail)) {
            emailsMap.set(mail, []);
        }
        emailsMap.get(mail).push(p);
    }

    let deletedCount = 0;

    for (const [mail, records] of emailsMap.entries()) {
        // Find if they are duplicates
        if (records.length > 1) {
            console.log(`Found ${records.length} records for ${mail}.`);
            // Sort by created_at descending (latest first)
            records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // Keep the first (most recent) one, delete the rest
            const toKeep = records[0];
            const toDeleteIds = records.slice(1).map(r => r.id);

            console.log(`Keeping: ${toKeep.id} (${toKeep.name})`);
            console.log(`Deleting clones: ${toDeleteIds.join(', ')}`);

            const { error: delError } = await supabase.from('patients').delete().in('id', toDeleteIds);
            if (delError) {
                console.error(`Error deleting clones for ${mail}:`, delError);
            } else {
                deletedCount += toDeleteIds.length;
            }
        }
    }

    console.log('-----------------------------------');
    console.log(`Cleanup finished. Removed ${deletedCount} duplicate clones.`);
}

cleanDuplicates();
