import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import Tailwind

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add it here
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // Redirects API calls to your backend
    }
  }
})