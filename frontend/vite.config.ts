import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Configures React, Tailwind, and the local development server for Vite.
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { port: 5173 },
});
