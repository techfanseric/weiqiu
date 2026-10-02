import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx'
import dotenv from 'dotenv';
import { fileURLToPath, URL } from 'node:url'
import { viteMockServe } from 'vite-plugin-mock'
const env: any = dotenv.config();
const apiBaseUrl = process.env.VITE_API_BASE_URL || env.parsed?.VITE_API_BASE_URL || 'http://127.0.0.1:8080';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_PUBLIC_DEMO": JSON.stringify(mode === "demo" ? "true" : "false"),
  },
  plugins: [
    vue(),
    vueJsx(),
    viteMockServe({
      logger: true,
      mockPath: 'mock',
      enable: mode !== "demo",
    })
  ],
  base:'./',
  server:{
    host: '0.0.0.0',
    port: 9006,
    proxy:{
      '/backend/': {
        target: apiBaseUrl,
        changeOrigin: true,
      },
      '/automation/': {
        target: apiBaseUrl,
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      }
    ]
  },
  build: {
    cssCodeSplit: true, 
    sourcemap: false, 
    target: ['es2015', 'chrome72'], 
    chunkSizeWarningLimit: 2400, 
    assetsInlineLimit: 4096, 
  },
}));
