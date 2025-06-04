import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ['src'],
            exclude: ['**/*.test.ts', '**/*.test.tsx']
        })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: 'index'
        },
        cssCodeSplit: true,
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                '@mantine/core',
                '@mantine/dates',
                '@mantine/form',
                '@mantine/hooks',
                '@mantine/notifications',
                '@mantine/modals',
                'react/jsx-runtime',
                'date-fns',
                'dayjs',
                'react-icons'
            ],
            output: {
                assetFileNames: 'index.[ext]',
                exports: 'named'
            }
        }
    },
    css: {
        modules: {
            localsConvention: 'camelCase',
            generateScopedName: '[name]__[local]__[hash:base64:5]'
        }
    }
});
