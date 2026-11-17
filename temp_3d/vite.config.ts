import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/mountRoomDesigner.tsx'),
        name: 'SusriRoom3D',
        fileName: () => 'room3d.js',
        formats: ['iife'],
      },
      cssCodeSplit: false,
      outDir: path.resolve(__dirname, '../dist_3d'),
      emptyOutDir: true,
      rollupOptions: {
        // Bundle all dependencies into the single file
      },
    },
  };
});
