/// <reference types="node" />

import { copyFile } from 'fs/promises';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';
import { configDefaults } from 'vitest/config';

const base = '/WebTools/';
// const base = process.env.GITHUB_PAGES === 'true' ? '/TextReplacement/' : '/';
const rootDir = process.cwd();

function githubPagesSpaFallback(): PluginOption {
  return {
    name: 'github-pages-spa-fallback',
    async closeBundle() {
      const outputDir = resolve(rootDir, 'dist');
      try {
        await copyFile(resolve(outputDir, 'index.html'), resolve(outputDir, '404.html'));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          console.warn('Unable to create 404.html for GitHub Pages fallback.', error);
        }
      }
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), githubPagesSpaFallback()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/test-utils/**',
        '**/*.config.{js,ts}',
        'vite.config.ts'
      ]
    },
  }
});
