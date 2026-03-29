import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/user": { target: "http://localhost:3000", changeOrigin: true },
      "/room": { target: "http://localhost:3000", changeOrigin: true },
      "/guess": { target: "http://localhost:3000", changeOrigin: true },
      "/daily": { target: "http://localhost:3000", changeOrigin: true },
      "/health": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
