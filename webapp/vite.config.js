import { defineConfig } from "vite";

const config = {
  build: {
    chunkSizeWarningLimit: 1500
  },
  server: {
    port: 3000,
    host: true,
    open: true
  }
};

export default defineConfig(config);