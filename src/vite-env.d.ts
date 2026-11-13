/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BOT_STUDIO_BRAND_NAME?: string;
  readonly BOT_STUDIO_COLOR_THEME?: string;
  readonly BOT_STUDIO_COLOR_PRIMARY?: string;
  readonly BOT_STUDIO_COLOR_ACCENT?: string;
  readonly BOT_STUDIO_LOGO_URL?: string;
  readonly BOT_STUDIO_TELEGRAM_URL?: string;
  readonly BOT_STUDIO_WHATSAPP_URL?: string;
  readonly BOT_STUDIO_YOUTUBE_URL?: string;
  readonly BOT_STUDIO_TIKTOK_URL?: string;
  readonly BOT_STUDIO_INSTAGRAM_URL?: string;
  readonly BOT_STUDIO_FACEBOOK_URL?: string;
  readonly BOT_STUDIO_WEBSITE_URL?: string;
  readonly BOT_STUDIO_PARTNERS_URL?: string;
  readonly BOT_STUDIO_SUPPORT_EMAIL?: string;
  readonly BOT_STUDIO_HOSTNAME?: string;
  readonly BOT_STUDIO_WS_APP_ID?: string;
  readonly NEXT_PUBLIC_DERIV_APP_ID?: string;
  readonly NEXT_PUBLIC_DERIV_WS_APP_ID?: string;
  readonly NEXT_PUBLIC_BRAND_PRIMARY?: string;
  readonly DERIV_OAUTH_CLIENT_ID?: string;
  readonly DERIV_WS_APP_ID?: string;
  readonly DERIV_OAUTH_REDIRECT_URI?: string;
  readonly DERIV_TOKEN_EXCHANGE_URL?: string;
  readonly VITE_BRAND_NAME?: string;
  readonly VITE_THEME_COLOR?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_TELEGRAM_URL?: string;
  readonly VITE_WHATSAPP_URL?: string;
  readonly VITE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
