import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// React is bundled with the app AND exposed on window so the Messenger
// design-system bundle (which calls a bare `React.createElement`) shares
// the exact same React instance — see src/main.jsx.
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    // The AI calls go through the tiny Express proxy (server/index.js),
    // which holds OPENAI_API_KEY. `npm run dev` starts both processes.
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 8787}`,
        changeOrigin: true,
      },
    },
  },
})
