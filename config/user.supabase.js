import { createClient } from '@supabase/supabase-js';
import { SB_URL, SUPABASE_SERVICE_ANON_KEY} from './env.js';

if (!SB_URL || !SUPABASE_SERVICE_ANON_KEY) {
    throw new Error('Supabase URL and Service Role Key are required');
}

const supabaseUser = createClient(SB_URL, SUPABASE_SERVICE_ANON_KEY);


export default supabaseUser;
