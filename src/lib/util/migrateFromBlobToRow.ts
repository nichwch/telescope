import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../DatabaseDefinitions';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// https://github.com/sveltejs/kit/discussions/9807
console.log('Hello world from the script');

const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const allLists = await supabase.from('lists').select('*');
console.dir(allLists, { depth: null });
