import { getSupabaseAdmin } from './supabase-admin';

async function runDiagnose() {
    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.from('ads').select('id, title, image_url, mobile_image_url, position').limit(10);

        if (error) {
            console.error('DATABASE_ERROR:', error);
            return;
        }

        console.log('--- ADS DATABASE DATA ---');
        data.forEach(ad => {
            console.log(`Ad: ${ad.title}`);
            console.log(`  Position: ${ad.position}`);
            console.log(`  Desktop URL: ${ad.image_url}`);
            console.log(`  Mobile URL: ${ad.mobile_image_url}`);
            console.log('-------------------------');
        });
    } catch (e) {
        console.error('DIAGNOSE_EXECUTION_ERROR:', e);
    }
}

runDiagnose();
