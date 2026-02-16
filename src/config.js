// API Configuration - Updated for production
export const API_URL = import.meta.env.VITE_BACKEND_URL || '';

console.log('🔧 API Configuration:', API_URL || 'Using same domain (Vercel)');
