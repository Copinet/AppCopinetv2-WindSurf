import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fuowuvoepioydffjwequ.supabase.co';
const supabaseAnonKey = 'sb_publishable_IqanLNKqKFzIrw0d80idug_gA5jtGf5';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
