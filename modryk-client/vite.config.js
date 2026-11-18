import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./assets"),
    },
  },
  server: {
    proxy: {
      // توجيه طلبات الـ API إلى منفذ MediaMTX 9997
      "/mediamtx-api": {
        target: "http://localhost:9997",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mediamtx-api/, ""),
      },
      // توجيه طلبات الـ WHEP إلى منفذ MediaMTX 8889
      "/mediamtx-stream": {
        target: "http://localhost:8889",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mediamtx-stream/, ""),
      },
    },
  },
});
