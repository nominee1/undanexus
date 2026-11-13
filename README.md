# UndaNexus

White-label **UndaNexus AI** trading site (Vite + React + TypeScript + Tailwind), rebuilt for Denara Sites from the Digits Options / NexusAI product shape.

## Routes

| Path | Page |
| --- | --- |
| `/` | Marketing landing (hero, offer banner, FAQ, socials) |
| `/nexusai` | Trading dashboard (Free / Premium / Ultra) — supports `#nexus-premium-bot` |

## Branding

- Default site name: **UndaNexus**
- Product name: **UndaNexus AI** (replaces Nexus AI / NexusAI)
- Tenant `BOT_STUDIO_BRAND_NAME` replaces every “UndaNexus” string (e.g. brand `South FX` → product `South FX AI`)
- Theme color via `BOT_STUDIO_COLOR_THEME`
- Socials / support email stay empty until the tenant fills them on deploy — no Digits Options links

## Auth (same pattern as Undahub / Undaweb)

1. PKCE authorize → `auth.deriv.com`
2. Callback `?code=` → `DERIV_TOKEN_EXCHANGE_URL` (`/api/auth/token-exchange` on undasite.com)
3. Platform shared callback: `undasite.com/api/auth/site-oauth/start` + handoff when redirect URI is the shared callback
4. Legacy `?token1=` still accepted

Env baked by Denara Sites: `DERIV_OAUTH_CLIENT_ID`, `DERIV_OAUTH_REDIRECT_URI`, `DERIV_TOKEN_EXCHANGE_URL`, `DERIV_WS_APP_ID`, brand/social Bot Studio keys.

## Local

```bash
npm install
npm run dev
```

```
VITE_BRAND_NAME=My Brand
VITE_THEME_COLOR=#f59e0b
VITE_APP_ID=your_deriv_app_id
```

## Build

```bash
npm run build
```
