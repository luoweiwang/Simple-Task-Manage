/**
 * File cấu hình tập trung cho ứng dụng.
 */

export const CONFIG = {
  SUPABASE: {
    // NHẬP URL VÀ ANON KEY CỦA BẠN VÀO ĐÂY NẾU BỊ LỖI "INVALID API KEY"
    URL: process.env.SUPABASE_URL || 'https://yqbtczhszmhoqssqvulb.supabase.co',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYnRjemhzem1ob3Fzc3F2dWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODQzNTEsImV4cCI6MjA4MzI2MDM1MX0.CPJUYJJjHZfNxOYPbN89nOHX68TL8bmoVaz6H3hl4zs',
  },
  GEMINI: {
    MODEL: 'gemini-3-flash-preview',
    API_KEY: process.env.API_KEY || '',
  },
  APP: {
    NAME: 'SmartTask Flow',
    VERSION: '1.2.5',
    BASE_URL: typeof window !== 'undefined' ? window.location.origin : '',
  }
};