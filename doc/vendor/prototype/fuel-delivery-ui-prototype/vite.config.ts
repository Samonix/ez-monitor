import { defineConfig, type UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default {
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
} satisfies UserConfig;
