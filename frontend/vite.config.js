import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Vendor chunks
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                            return 'react-vendor';
                        }
                        if (id.includes('@radix-ui')) {
                            return 'ui-vendor';
                        }
                        if (id.includes('axios') || id.includes('sonner') || id.includes('lucide-react') || id.includes('clsx') || id.includes('class-variance-authority')) {
                            return 'utils-vendor';
                        }
                        return 'vendor';
                    }
                    // App chunks
                    if (id.includes('/pages/Login') || id.includes('/pages/AuthCallback') || id.includes('/contexts/AuthContext') || id.includes('/services/authService')) {
                        return 'auth';
                    }
                    if (id.includes('/pages/Users') || id.includes('/components/settings/PermissionsSettings') || id.includes('/services/userService') || id.includes('/services/permissionService')) {
                        return 'admin';
                    }
                    if (id.includes('/pages/SettingsPage') || id.includes('/components/settings/')) {
                        return 'settings';
                    }
                    return 'app';
                }
            }
        },
        chunkSizeWarningLimit: 600
    },
    server: {
        port: 3001,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        },
        hmr: {
            overlay: true
        }
    },
    css: {
        devSourcemap: true
    }
});
