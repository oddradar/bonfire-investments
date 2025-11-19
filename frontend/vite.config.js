// Import Vite helper + React plugin
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Export config so Vite knows to use React
export default defineConfig({
  plugins: [react()],
});
