
/**
 * File cấu hình tập trung cho ứng dụng.
 * Vite sẽ tự động thay thế các cụm process.env.KEY bằng giá trị thực tế khi build.
 */

export const CONFIG = {
  SUPABASE: {
    // Truy cập trực tiếp để Vite's 'define' có thể nhận diện và thay thế chuỗi
    URL: process.env.SUPABASE_URL || 'https://yqbtczhszmhoqssqvulb.supabase.co',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  },
  GEMINI: {
    MODEL: 'gemini-3-flash-preview',
    API_KEY: process.env.API_KEY || '',
  },
  APP: {
    NAME: 'SmartTask Flow',
    VERSION: '1.2.2',
    BASE_URL: typeof window !== 'undefined' ? window.location.origin : '',
  }
};
