import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/** Expose Denara Sites / Bot Studio env to the client at build time. */
function studioDefine(env: Record<string, string>) {
    const keys = [
        'BOT_STUDIO_BRAND_NAME',
        'BOT_STUDIO_COLOR_THEME',
        'BOT_STUDIO_COLOR_PRIMARY',
        'BOT_STUDIO_COLOR_ACCENT',
        'BOT_STUDIO_LOGO_URL',
        'BOT_STUDIO_TELEGRAM_URL',
        'BOT_STUDIO_WHATSAPP_URL',
        'BOT_STUDIO_YOUTUBE_URL',
        'BOT_STUDIO_TIKTOK_URL',
        'BOT_STUDIO_INSTAGRAM_URL',
        'BOT_STUDIO_FACEBOOK_URL',
        'BOT_STUDIO_WEBSITE_URL',
        'BOT_STUDIO_PARTNERS_URL',
        'BOT_STUDIO_SUPPORT_EMAIL',
        'BOT_STUDIO_HOSTNAME',
        'BOT_STUDIO_WS_APP_ID',
        'NEXT_PUBLIC_DERIV_APP_ID',
        'NEXT_PUBLIC_DERIV_WS_APP_ID',
        'NEXT_PUBLIC_BRAND_PRIMARY',
        'DERIV_OAUTH_CLIENT_ID',
        'DERIV_WS_APP_ID',
        'DERIV_OAUTH_REDIRECT_URI',
        'DERIV_TOKEN_EXCHANGE_URL',
        'VITE_BRAND_NAME',
        'VITE_THEME_COLOR',
        'VITE_SUPPORT_EMAIL',
        'VITE_TELEGRAM_URL',
        'VITE_WHATSAPP_URL',
        'VITE_APP_ID',
    ] as const;

    const define: Record<string, string> = {};
    for (const key of keys) {
        const value = env[key] ?? process.env[key] ?? '';
        define[`import.meta.env.${key}`] = JSON.stringify(value);
    }
    return define;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        define: studioDefine(env),
        server: {
            port: 5173,
            host: true,
        },
        build: {
            outDir: 'dist',
            sourcemap: false,
        },
    };
});
