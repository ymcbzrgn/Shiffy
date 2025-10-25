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
        target: 'https://ejwkzjotxfg3i7-8888.proxy.runpod.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/runpod/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add API key to all requests
            proxyReq.setHeader('x-api-key', 'eo2fXSAK6Mpq+27+KYtCfHKeHepqRD/tleFGFCNmkIVxC21c/iqmL0zNb3B/D+T/');
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
