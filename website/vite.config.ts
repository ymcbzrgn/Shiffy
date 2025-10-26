import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy RunPod API to bypass CORS
      '/api/runpod': {
        target: 'https://3fg3p55cngmmn1-8888.proxy.runpod.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/runpod/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add API key to all requests (optional for public endpoints)
            // proxyReq.setHeader('x-api-key', 'YOUR_API_KEY_HERE');
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
