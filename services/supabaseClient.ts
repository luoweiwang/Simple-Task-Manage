
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';

// Khởi tạo client sử dụng các giá trị từ cấu hình tập trung
export const supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.ANON_KEY);
