import path from 'node:path';
import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';
import essor from 'unplugin-essor/vite';
import UnoCSS from 'unocss/vite';
export default defineConfig({
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, '/src')}/`,
    },
  },
  define: {
    'process.env.BABEL_TYPES_8_BREAKING': 'false',
    'process.env.NODE_DEBUG': 'false',
  },
  server: {
    fs: {
      // Allow serving files from the parent workspace
      allow: ['..'],
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['monaco-editor'],
          'babel': ['@babel/standalone', '@babel/core'],
          'vendor': ['essor', 'fflate', 'lodash-es'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['monaco-editor', '@babel/standalone', 'essor'],
  },
  plugins: [Inspect(), UnoCSS(), essor()],
});
