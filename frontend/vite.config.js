import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  server: {
    port: 5173, // change this to whatever port you want
    strictPort: true, // optional: will throw an error if the port is taken
    open: true // optional: opens browser automatically
  }
})
