
/**
 * File cấu hình tập trung cho ứng dụng.
 * Được tối ưu để không gây lỗi crash trên trình duyệt khi thiếu biến process.
 */

const getEnv = (key: string, defaultValue: string): string => {
  try {
    // Kiểm tra an toàn sự tồn tại của process.env
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // Silent catch
  }
  return defaultValue;
};

export const CONFIG = {
  SUPABASE: {
    URL: getEnv('SUPABASE_URL', 'https://yqbtczhszmhoqssqvulb.supabase.co'),
    ANON_KEY: getEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYnRjemhzem1ob3Fzc3F2dWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODQzNTEsImV4cCI6MjA4MzI2MDM1MX0.CPJUYJJjHZfNxOYPbN89nOHX68TL8bmoVaz6H3hl4zs'),
  },
  GEMINI: {
    MODEL: 'gemini-3-flash-preview',
    API_KEY: getEnv('API_KEY', ''),
  },
  APP: {
    NAME: 'SmartTask Flow',
    VERSION: '1.2.1',
    BASE_URL: typeof window !== 'undefined' ? window.location.origin : '',
  }
};
