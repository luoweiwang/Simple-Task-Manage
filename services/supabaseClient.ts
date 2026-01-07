import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';

const supabaseUrl = CONFIG.SUPABASE.URL;
const supabaseAnonKey = CONFIG.SUPABASE.ANON_KEY;

// Nếu Key vẫn bị báo Invalid, hãy kiểm tra xem giá trị trong CONFIG có đúng không
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 10);
