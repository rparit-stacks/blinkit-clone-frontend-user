import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Ports: Vite 8080 | ApiGateway 8082 | Auth 8081 | UserService 8083 | Eureka 8761 | MySQL 3306
// Empty VITE_AUTH_BASE_URL: same-origin /auth + /api → proxy → http://localhost:8082
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Only /auth/<endpoint> — do NOT proxy bare GET /auth (React route /auth → index.html)
      "^/auth/.+": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
