var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        exclude: __spreadArray(__spreadArray([], configDefaults.exclude, true), ['e2e/**'], false),
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
