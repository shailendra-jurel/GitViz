import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Vite config - Mode:', mode);
  console.log('Vite config - Backend URL:', env.VITE_API_URL || 'https://gitviz.onrender.com/api');
  
  // Hardcode for production, use env var for development
  const backendUrl = mode === 'production' 
    ? 'https://gitviz.onrender.com/api'
    : (env.VITE_API_URL || 'http://localhost:5000/api');
  
  return {
    plugins: [tailwindcss(), react()],
    
    define: {
      // Use import.meta.env approach for environment variables
      'import.meta.env.VITE_API_URL': JSON.stringify(backendUrl)
    },
    
    build: {
      sourcemap: mode !== 'production'
    }
  }
});