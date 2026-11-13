import brandConfig from '../../brand.config.json';

type BrandFile = {
  brand_name?: string;
  brand_domain?: string;
  logo_url?: string;
  colors?: { primary?: string; accent?: string; secondary?: string };
  social?: {
    telegramUrl?: string;
    whatsappUrl?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    websiteUrl?: string;
    partnersUrl?: string;
    supportEmail?: string;
  };
};

const brand = brandConfig as BrandFile;

function pick(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return '';
}

function env(key: keyof ImportMetaEnv): string {
  try {
    return String(import.meta.env[key] ?? '').trim();
  } catch {
    return '';
  }
}

/** Digits Options primary amber — tenants override via theme picker / BOT_STUDIO_COLOR_THEME. */
export const DEFAULT_THEME = '#F5A623';

export type TenantConfig = {
  brandName: string;
  themeColor: string;
  accentColor: string;
  logoUrl: string;
  hostname: string;
  appId: string;
  oauthRedirectUri: string;
  tokenExchangeUrl: string;
  partnersUrl: string;
  supportEmail: string;
  social: {
    telegramUrl: string;
    whatsappUrl: string;
    youtubeUrl: string;
    tiktokUrl: string;
    instagramUrl: string;
    facebookUrl: string;
    websiteUrl: string;
  };
};

/**
 * Resolve white-label settings. Social / contact URLs stay empty unless the
 * tenant (or local env) supplies them — never ship Digits Options links.
 */
export function getTenantConfig(): TenantConfig {
  const themeColor =
    pick(
      env('BOT_STUDIO_COLOR_THEME'),
      env('BOT_STUDIO_COLOR_PRIMARY'),
      env('NEXT_PUBLIC_BRAND_PRIMARY'),
      env('VITE_THEME_COLOR'),
      brand.colors?.primary
    ) || DEFAULT_THEME;

  return {
    brandName:
      pick(env('BOT_STUDIO_BRAND_NAME'), env('VITE_BRAND_NAME'), brand.brand_name) || 'UndaNexus',
    themeColor,
    accentColor: pick(env('BOT_STUDIO_COLOR_ACCENT'), brand.colors?.accent) || themeColor,
    logoUrl: pick(env('BOT_STUDIO_LOGO_URL'), brand.logo_url),
    hostname: pick(env('BOT_STUDIO_HOSTNAME'), brand.brand_domain),
    appId: pick(
      env('BOT_STUDIO_WS_APP_ID'),
      env('NEXT_PUBLIC_DERIV_WS_APP_ID'),
      env('NEXT_PUBLIC_DERIV_APP_ID'),
      env('DERIV_WS_APP_ID'),
      env('DERIV_OAUTH_CLIENT_ID'),
      env('VITE_APP_ID')
    ),
    oauthRedirectUri: pick(env('DERIV_OAUTH_REDIRECT_URI')),
    tokenExchangeUrl: pick(env('DERIV_TOKEN_EXCHANGE_URL')),
    partnersUrl: pick(env('BOT_STUDIO_PARTNERS_URL'), brand.social?.partnersUrl),
    supportEmail: pick(
      env('BOT_STUDIO_SUPPORT_EMAIL'),
      env('VITE_SUPPORT_EMAIL'),
      brand.social?.supportEmail
    ),
    social: {
      telegramUrl: pick(
        env('BOT_STUDIO_TELEGRAM_URL'),
        env('VITE_TELEGRAM_URL'),
        brand.social?.telegramUrl
      ),
      whatsappUrl: pick(
        env('BOT_STUDIO_WHATSAPP_URL'),
        env('VITE_WHATSAPP_URL'),
        brand.social?.whatsappUrl
      ),
      youtubeUrl: pick(env('BOT_STUDIO_YOUTUBE_URL'), brand.social?.youtubeUrl),
      tiktokUrl: pick(env('BOT_STUDIO_TIKTOK_URL'), brand.social?.tiktokUrl),
      instagramUrl: pick(env('BOT_STUDIO_INSTAGRAM_URL'), brand.social?.instagramUrl),
      facebookUrl: pick(env('BOT_STUDIO_FACEBOOK_URL'), brand.social?.facebookUrl),
      websiteUrl: pick(env('BOT_STUDIO_WEBSITE_URL'), brand.social?.websiteUrl),
    },
  };
}

export function applyTenantTheme(themeColor: string) {
  const root = document.documentElement;
  root.style.setProperty('--brand', themeColor);
  root.style.setProperty('--brand-soft', `color-mix(in srgb, ${themeColor} 12%, transparent)`);
  root.style.setProperty('--brand-glow', `color-mix(in srgb, ${themeColor} 35%, transparent)`);
  // Keep semantic primary in sync with tenant brand when possible
  root.style.setProperty('--primary', hexToHslChannels(themeColor) || '38 92% 56%');
  root.style.setProperty('--ring', hexToHslChannels(themeColor) || '38 92% 56%');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', '#110f0d');
}

/** Convert #RRGGBB to "H S% L%" channels for hsl(var(--x)) usage. */
function hexToHslChannels(hex: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
