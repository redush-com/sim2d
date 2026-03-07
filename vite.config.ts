import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: [
            '@codemirror/view',
            '@codemirror/state',
            '@codemirror/lang-javascript',
            '@codemirror/theme-one-dark',
            '@codemirror/commands',
            '@codemirror/autocomplete',
            '@codemirror/language',
          ],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
