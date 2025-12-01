import { createClient } from '@supabase/supabase-js';
import { SB_URL, SUPABASE_SERVICE_ROLE_KEY } from './env.js';

if (!SB_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase URL and Service Role Key are required');
}

const supabase = createClient(SB_URL, SUPABASE_SERVICE_ROLE_KEY);

export default supabase;
