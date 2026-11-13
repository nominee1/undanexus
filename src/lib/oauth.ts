const TOKEN_KEY = 'undanexus_deriv_token';
const LOGINID_KEY = 'undanexus_deriv_loginid';
const PKCE_VERIFIER_KEY = 'undanexus_pkce_code_verifier';
const OAUTH_STATE_KEY = 'undanexus_oauth_state';
const PKCE_LS_KEY = 'undanexus_pkce_bridge_v1';
const DERIV_SCOPE = 'trading';
const CANONICAL_TOKEN_EXCHANGE = 'https://undasite.com/api/auth/token-exchange';
const PLATFORM_SITE_OAUTH_START = 'https://undasite.com/api/auth/site-oauth/start';
const PLATFORM_SITE_OAUTH_CALLBACK = 'https://undasite.com/auth/callback';
const PLATFORM_SITE_OAUTH_HANDOFF = 'https://undasite.com/api/auth/site-oauth/handoff';
const SITE_OAUTH_MESSAGE_TYPE = 'undasite_site_oauth';

export function getStoredAuth() {
  return {
    token: localStorage.getItem(TOKEN_KEY) || '',
    loginid: localStorage.getItem(LOGINID_KEY) || '',
  };
}

export function storeAuth(token: string, loginid?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  if (loginid) localStorage.setItem(LOGINID_KEY, loginid);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LOGINID_KEY);
}

function env(key: string): string {
  try {
    return String((import.meta.env as Record<string, string | undefined>)[key] ?? '').trim();
  } catch {
    return '';
  }
}

function isPlatformSharedCallbackUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    const path = url.pathname.replace(/\/$/, '');
    if (path !== '/auth/callback') return false;
    const host = url.hostname.toLowerCase();
    return host === 'undasite.com' || host === 'www.undasite.com' || host === 'localhost';
  } catch {
    return false;
  }
}

export function usesPlatformSiteOAuthCallback(): boolean {
  const redirectUri = env('DERIV_OAUTH_REDIRECT_URI');
  return Boolean(redirectUri && isPlatformSharedCallbackUri(redirectUri));
}

export function getOAuthClientId(): string {
  return (
    env('DERIV_OAUTH_CLIENT_ID') ||
    env('NEXT_PUBLIC_DERIV_APP_ID') ||
    env('BOT_STUDIO_WS_APP_ID') ||
    env('VITE_APP_ID')
  );
}

export function getWsAppId(): string {
  return (
    env('DERIV_WS_APP_ID') ||
    env('DERIV_OIDC_APP_ID') ||
    env('NEXT_PUBLIC_DERIV_WS_APP_ID') ||
    env('BOT_STUDIO_WS_APP_ID') ||
    env('VITE_APP_ID')
  );
}

export function getOAuthRedirectUri(): string {
  if (usesPlatformSiteOAuthCallback()) return PLATFORM_SITE_OAUTH_CALLBACK;
  const fromEnv = env('DERIV_OAUTH_REDIRECT_URI');
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      return fromEnv.replace(/\/$/, '');
    }
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export function getTokenExchangeUrl(): string {
  const fromEnv = env('DERIV_TOKEN_EXCHANGE_URL');
  if (fromEnv) {
    try {
      const parsed = new URL(fromEnv);
      if (
        parsed.pathname === '/api/auth/token-exchange' &&
        (parsed.hostname === 'denara-sites.vercel.app' ||
          /^denara-sites-[a-z0-9]+\.vercel\.app$/i.test(parsed.hostname))
      ) {
        return CANONICAL_TOKEN_EXCHANGE;
      }
    } catch {
      /* use as-is */
    }
    return fromEnv;
  }
  return CANONICAL_TOKEN_EXCHANGE;
}

function generateRandomString(length = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, v => chars[v % chars.length]).join('');
}

async function createCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let str = '';
  bytes.forEach(b => {
    str += String.fromCharCode(b);
  });
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function setPkceBridge(verifier: string, state: string) {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  try {
    localStorage.setItem(PKCE_LS_KEY, JSON.stringify({ v: verifier, s: state, t: Date.now() }));
  } catch {
    /* noop */
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `undanexus_pkce_v=${encodeURIComponent(verifier)}; path=/; max-age=600; SameSite=Lax${secure}`;
  document.cookie = `undanexus_pkce_s=${encodeURIComponent(state)}; path=/; max-age=600; SameSite=Lax${secure}`;
}

function readCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function clearPkceBridge() {
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  try {
    localStorage.removeItem(PKCE_LS_KEY);
  } catch {
    /* noop */
  }
  document.cookie = 'undanexus_pkce_v=; path=/; max-age=0';
  document.cookie = 'undanexus_pkce_s=; path=/; max-age=0';
}

function readPkceFallback(): { verifier: string; state: string } | null {
  let verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY) || '';
  let state = sessionStorage.getItem(OAUTH_STATE_KEY) || '';
  if (!verifier || !state) {
    verifier = readCookie('undanexus_pkce_v');
    state = readCookie('undanexus_pkce_s');
  }
  if (!verifier || !state) {
    try {
      const raw = localStorage.getItem(PKCE_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { v?: string; s?: string; t?: number };
        if (parsed.v && parsed.s && parsed.t && Date.now() - parsed.t < 600_000) {
          verifier = parsed.v;
          state = parsed.s;
        }
      }
    } catch {
      /* noop */
    }
  }
  if (!verifier) return null;
  return { verifier, state };
}

/** Start Deriv OAuth2 PKCE (or platform shared site-oauth start). */
export async function startDerivOAuthLogin(): Promise<void> {
  const clientId = getOAuthClientId();
  if (!clientId) {
    throw new Error('Deriv App ID is not configured. Deploy with Denara Sites to assign one.');
  }

  if (usesPlatformSiteOAuthCallback()) {
    const start = new URL(PLATFORM_SITE_OAUTH_START);
    start.searchParams.set('return_to', window.location.origin);
    start.searchParams.set('app_id', clientId);
    window.location.assign(start.toString());
    return;
  }

  const redirectUri = getOAuthRedirectUri();
  if (!redirectUri) throw new Error('Missing OAuth redirect URL for this deployment.');

  const codeVerifier = generateRandomString(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const state = generateRandomString(32);
  setPkceBridge(codeVerifier, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: DERIV_SCOPE,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  const wsAppId = getWsAppId();
  if (wsAppId) params.set('app_id', wsAppId);

  window.location.assign(`https://auth.deriv.com/oauth2/auth?${params.toString()}`);
}

export function parseOAuthAccessTokenFromExchangeBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const at = (body as Record<string, unknown>).access_token;
  return typeof at === 'string' && at.length > 0 ? at : null;
}

export type OAuthCallbackResult =
  | { status: 'success'; code: string; codeVerifier?: string; redirectUri: string }
  | { status: 'error'; error: string; errorDescription: string }
  | { status: 'none' };

export function handleOAuthCallbackQuery(): OAuthCallbackResult {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state') ?? '';
  const error = params.get('error');
  const errorDescription = params.get('error_description') ?? '';

  if (!code && !error) return { status: 'none' };
  if (error) return { status: 'error', error, errorDescription };

  const fallback = readPkceFallback();
  const redirectUri = getOAuthRedirectUri();
  clearPkceBridge();

  if (!code) return { status: 'none' };

  // Prefer matching state when available; still attempt exchange if verifier exists (mobile clears storage).
  if (fallback?.state && state && fallback.state !== state && !fallback.verifier) {
    return { status: 'error', error: 'state_mismatch', errorDescription: 'OAuth state mismatch' };
  }

  return {
    status: 'success',
    code,
    codeVerifier: fallback?.verifier,
    redirectUri,
  };
}

export function cleanOAuthParamsFromUrl() {
  const url = new URL(window.location.href);
  ['code', 'state', 'scope', 'error', 'error_description', 'site_oauth_handoff'].forEach(k =>
    url.searchParams.delete(k)
  );
  const search = url.searchParams.toString();
  window.history.replaceState({}, '', `${url.pathname}${search ? `?${search}` : ''}${url.hash}`);
}

/** Legacy ?token1= redirects (older Deriv OAuth). */
export function consumeLegacyTokenParamsFromUrl(): { token: string; loginid: string } | null {
  const params = new URLSearchParams(window.location.search);
  if (!params.get('token1') && window.location.hash.includes('token1=')) {
    const q = window.location.hash.split('?')[1] || '';
    new URLSearchParams(q).forEach((v, k) => params.set(k, v));
  }
  const token = params.get('token1') || params.get('token') || '';
  const loginid = params.get('acct1') || params.get('loginid') || '';
  if (!token) return null;
  storeAuth(token, loginid);
  cleanOAuthParamsFromUrl();
  return { token, loginid };
}

export async function exchangeAuthorizationCode(input: {
  code: string;
  codeVerifier?: string;
  redirectUri: string;
}): Promise<string> {
  const payload: Record<string, string> = {
    code: input.code,
    redirect_uri: input.redirectUri,
  };
  if (input.codeVerifier) payload.code_verifier = input.codeVerifier;
  const oauthClientId = getOAuthClientId();
  const wsAppId = getWsAppId();
  if (oauthClientId) payload.oauth_client_id = oauthClientId;
  if (wsAppId) payload.ws_app_id = wsAppId;

  const res = await fetch(getTokenExchangeUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* leave string */
  }
  const accessToken = parseOAuthAccessTokenFromExchangeBody(body);
  if (!res.ok || !accessToken) {
    throw new Error(
      typeof body === 'object' && body && 'error_description' in body
        ? String((body as { error_description: string }).error_description)
        : 'Token exchange failed. Try logging in again in the same browser tab.'
    );
  }
  return accessToken;
}

export async function redeemSiteOAuthHandoff(handoff: string): Promise<string> {
  const res = await fetch(PLATFORM_SITE_OAUTH_HANDOFF, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handoff }),
  });
  const body = (await res.json().catch(() => null)) as unknown;
  const accessToken = parseOAuthAccessTokenFromExchangeBody(body);
  if (!res.ok || !accessToken) {
    throw new Error('Shared Deriv sign-in could not finish. Try again.');
  }
  return accessToken;
}

export function listenForSiteOAuthHandoff(onHandoff: (handoff: string) => void): () => void {
  const onMessage = (event: MessageEvent) => {
    let allowed = '';
    try {
      allowed = new URL(PLATFORM_SITE_OAUTH_CALLBACK).origin;
    } catch {
      return;
    }
    if (event.origin !== allowed) return;
    const data = event.data as { type?: string; handoff?: string | null; error?: string | null };
    if (data?.type !== SITE_OAUTH_MESSAGE_TYPE) return;
    if (data.handoff) onHandoff(data.handoff);
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}

/** @deprecated use startDerivOAuthLogin */
export function buildDerivOAuthUrl(appId: string, redirectUri?: string) {
  const redirect = redirectUri?.trim() || window.location.origin;
  const url = new URL('https://oauth.deriv.com/oauth2/authorize');
  url.searchParams.set('app_id', appId);
  url.searchParams.set('l', 'EN');
  url.searchParams.set('brand', 'deriv');
  url.searchParams.set('redirect_uri', redirect);
  return url.toString();
}

/** @deprecated */
export function consumeOAuthParamsFromUrl() {
  return consumeLegacyTokenParamsFromUrl();
}
