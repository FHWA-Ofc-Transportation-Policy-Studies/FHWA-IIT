import { defineConfig } from "vite";

const config = {
  build: {
    chunkSizeWarningLimit: 1500
  },
  server: {
    port: 3000,
    host: true,
    open: true
  },
  base: 'https://maps.dot.gov/fhwa/niit-dev/'
};

export default defineConfig(config);