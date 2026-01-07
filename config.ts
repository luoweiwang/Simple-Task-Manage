
/**
 * File cấu hình tập trung cho ứng dụng.
 * Hỗ trợ tự động lấy thông tin từ biến môi trường khi deploy lên các nền tảng như Vercel/Netlify.
 */

export const CONFIG = {
  SUPABASE: {
    // Ưu tiên lấy từ biến môi trường, nếu không có sẽ dùng giá trị mặc định
    URL: (typeof process !== 'undefined' && process.env.SUPABASE_URL) 
      ? process.env.SUPABASE_URL 
      : 'https://yqbtczhszmhoqssqvulb.supabase.co',
    
    ANON_KEY: (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY) 
      ? process.env.SUPABASE_ANON_KEY 
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYnRjemhzem1ob3Fzc3F2dWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODQzNTEsImV4cCI6MjA4MzI2MDM1MX0.CPJUYJJjHZfNxOYPbN89nOHX68TL8bmoVaz6H3hl4zs',
  },
  GEMINI: {
    MODEL: 'gemini-3-flash-preview',
  },
  APP: {
    NAME: 'SmartTask Flow',
    VERSION: '1.2.0',
    // Tự động xác định URL hiện tại để phục vụ tính năng chia sẻ
    BASE_URL: typeof window !== 'undefined' ? window.location.origin : '',
  }
};
