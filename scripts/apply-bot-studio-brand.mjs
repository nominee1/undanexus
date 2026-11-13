#!/usr/bin/env node
/**
 * Patches brand.config.json from Denara Sites deploy env before build.
 * Leaves social / contact fields empty unless the tenant supplied them.
 */
import fs from 'fs/promises';
import path from 'path';

function env(name) {
  return process.env[name]?.trim() || '';
}

async function main() {
  const brandPath = env('BOT_STUDIO_BRAND_PATH') || 'brand.config.json';
  const absolute = path.resolve(process.cwd(), brandPath);
  let brand = {};
  try {
    brand = JSON.parse(await fs.readFile(absolute, 'utf8'));
  } catch {
    brand = {};
  }

  const brandName = env('BOT_STUDIO_BRAND_NAME') || env('VITE_BRAND_NAME');
  const hostname = env('BOT_STUDIO_HOSTNAME');
  const theme =
    env('BOT_STUDIO_COLOR_THEME') ||
    env('BOT_STUDIO_COLOR_PRIMARY') ||
    env('NEXT_PUBLIC_BRAND_PRIMARY') ||
    env('VITE_THEME_COLOR');

  brand.brand_name = brandName || brand.brand_name || 'UndaNexus';
  if (hostname) brand.brand_domain = hostname;
  brand.colors = {
    ...(brand.colors || {}),
    primary: theme || brand.colors?.primary || '#f59e0b',
    accent: env('BOT_STUDIO_COLOR_ACCENT') || theme || brand.colors?.accent || '#fbbf24',
    secondary: brand.colors?.secondary || '#0f0b0a',
  };

  brand.social = {
    telegramUrl: env('BOT_STUDIO_TELEGRAM_URL') || env('VITE_TELEGRAM_URL') || '',
    whatsappUrl: env('BOT_STUDIO_WHATSAPP_URL') || env('VITE_WHATSAPP_URL') || '',
    youtubeUrl: env('BOT_STUDIO_YOUTUBE_URL') || '',
    tiktokUrl: env('BOT_STUDIO_TIKTOK_URL') || '',
    instagramUrl: env('BOT_STUDIO_INSTAGRAM_URL') || '',
    facebookUrl: env('BOT_STUDIO_FACEBOOK_URL') || '',
    websiteUrl: env('BOT_STUDIO_WEBSITE_URL') || '',
    partnersUrl: env('BOT_STUDIO_PARTNERS_URL') || '',
    supportEmail: env('BOT_STUDIO_SUPPORT_EMAIL') || env('VITE_SUPPORT_EMAIL') || '',
  };

  if (env('BOT_STUDIO_LOGO_URL')) brand.logo_url = env('BOT_STUDIO_LOGO_URL');

  await fs.writeFile(absolute, `${JSON.stringify(brand, null, 2)}\n`, 'utf8');
  console.log(`[undanexus] patched ${brandPath} name=${brand.brand_name} theme=${brand.colors.primary}`);
}

main().catch(err => {
  console.error('[undanexus] brand patch failed:', err);
  process.exit(1);
});
