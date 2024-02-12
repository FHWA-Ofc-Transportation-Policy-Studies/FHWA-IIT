
import { resolve } from 'path'
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    return {
      publicDir: "public/fhwa",
      build: {
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
            nested: resolve(__dirname, 'iitTool.html'),
          },
        },
      },
      server: {
        port: 3000,
        host: true,
        open: true
      },
        base: 'https://maps.dot.gov/fhwa/iit/'
    }
  } else {
    // mode === 'development' or 'staging'
    return {
      publicDir: "public/fhwa",
      build: {
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
            nested: resolve(__dirname, 'iitTool.html'),
          },
        },
      },
      server: {
        port: 3000,
        host: true,
        open: true
      },
        base: 'https://maps.dot.gov/fhwa/iit-dev/'
    }
  }
})