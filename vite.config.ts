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

  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {},
      },
    },
  },
  plugins: [Inspect(), UnoCSS(), essor()],
});
