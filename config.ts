
/**
 * File cấu hình tập trung cho ứng dụng.
 * Khi deploy lên Vercel/Netlify, bạn nên ưu tiên sử dụng biến môi trường (Environment Variables).
 */

export const CONFIG = {
  SUPABASE: {
    URL: 'https://yqbtczhszmhoqssqvulb.supabase.co',
    // Lưu ý: Trong thực tế, Anon Key nên được giữ kín hoặc cấu hình qua biến môi trường
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYnRjemhzem1ob3Fzc3F2dWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODQzNTEsImV4cCI6MjA4MzI2MDM1MX0.CPJUYJJjHZfNxOYPbN89nOHX68TL8bmoVaz6H3hl4zs',
  },
  GEMINI: {
    MODEL: 'gemini-3-flash-preview',
  },
  APP: {
    NAME: 'SmartTask Flow',
    VERSION: '1.1.0',
  }
};
