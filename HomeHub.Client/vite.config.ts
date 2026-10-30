import stylex from '@stylexjs/unplugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const backend = process.env.HOMEHUB_API ?? 'http://localhost:5000';

export default defineConfig({
  plugins: [stylex.vite({ devMode: 'full' }), react()],
  server: {
    port: 5173,
    proxy: {
      '/HomeHub.': { target: backend, changeOrigin: true },
      '/api': { target: backend, changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      '/HomeHub.': { target: backend, changeOrigin: true },
      '/api': { target: backend, changeOrigin: true },
    },
  },
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: {
        // Stable vendor chunks: app changes no longer invalidate the framework/RPC caches,
        // and route chunks (see router.tsx) load their code on demand.
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
            },
            {
              name: 'vendor-router',
              test: /node_modules[\\/]@tanstack[\\/](react-router|router-core|history)[\\/]/,
              priority: 30,
            },
            {
              name: 'vendor-rpc',
              test: /node_modules[\\/](@connectrpc|@bufbuild)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-markdown',
              test: /node_modules[\\/](react-markdown|remark-[^\\/]+|mdast-util-[^\\/]+|micromark[^\\/]*|unified|vfile[^\\/]*|hast-util-[^\\/]+|unist-[^\\/]+|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|character-entities[^\\/]*|parse-entities|stringify-entities|trim-lines|longest-streak|markdown-table|ccount|escape-string-regexp|zwitch|bail|trough|is-plain-obj|devlop|style-to-object|inline-style-parser|html-url-attributes|html-void-elements|web-namespaces|entities)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
