import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DerivApi } from '@/lib/deriv-api';
import {
  clearAuth,
  cleanOAuthParamsFromUrl,
  consumeLegacyTokenParamsFromUrl,
  exchangeAuthorizationCode,
  getOAuthClientId,
  getStoredAuth,
  getWsAppId,
  handleOAuthCallbackQuery,
  listenForSiteOAuthHandoff,
  redeemSiteOAuthHandoff,
  startDerivOAuthLogin,
  storeAuth,
} from '@/lib/oauth';
import { getTenantConfig } from '@/config/tenant';

type AuthState = {
  ready: boolean;
  authorizing: boolean;
  token: string;
  loginid: string;
  balance: number | null;
  currency: string;
  error: string;
  api: DerivApi | null;
  authorizeWithDeriv: () => void;
  logout: () => void;
  refreshBalance: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const tenant = useMemo(() => getTenantConfig(), []);
  const [ready, setReady] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [token, setToken] = useState('');
  const [loginid, setLoginid] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const [api, setApi] = useState<DerivApi | null>(null);

  const hydrateWithToken = useCallback(
    async (accessToken: string) => {
      const appId = getWsAppId() || getOAuthClientId() || tenant.appId;
      if (!appId) {
        throw new Error('Deriv App ID is not configured. Deploy with Denara Sites to assign one.');
      }
      const client = new DerivApi(appId);
      const auth = await client.authorize(accessToken);
      storeAuth(accessToken, auth.loginid);
      setApi(client);
      setToken(accessToken);
      setLoginid(auth.loginid);
      setBalance(auth.balance);
      setCurrency(auth.currency || 'USD');
      setError('');
    },
    [tenant.appId]
  );

  const bootstrap = useCallback(async () => {
    setAuthorizing(true);
    setError('');
    try {
      const siteHandoff = new URLSearchParams(window.location.search).get('site_oauth_handoff');
      if (siteHandoff) {
        cleanOAuthParamsFromUrl();
        const accessToken = await redeemSiteOAuthHandoff(siteHandoff);
        await hydrateWithToken(accessToken);
        return;
      }

      const callback = handleOAuthCallbackQuery();
      if (callback.status === 'error') {
        cleanOAuthParamsFromUrl();
        setError(callback.errorDescription || callback.error || 'Sign-in failed');
        return;
      }
      if (callback.status === 'success') {
        cleanOAuthParamsFromUrl();
        const accessToken = await exchangeAuthorizationCode({
          code: callback.code,
          codeVerifier: callback.codeVerifier,
          redirectUri: callback.redirectUri,
        });
        await hydrateWithToken(accessToken);
        return;
      }

      const legacy = consumeLegacyTokenParamsFromUrl();
      const stored = legacy || getStoredAuth();
      if (!stored.token) return;
      await hydrateWithToken(stored.token);
    } catch (err) {
      clearAuth();
      setApi(null);
      setToken('');
      setLoginid('');
      setBalance(null);
      setError(err instanceof Error ? err.message : 'Authorization failed');
    } finally {
      setReady(true);
      setAuthorizing(false);
    }
  }, [hydrateWithToken]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    return listenForSiteOAuthHandoff(handoff => {
      setAuthorizing(true);
      void redeemSiteOAuthHandoff(handoff)
        .then(hydrateWithToken)
        .catch(err => setError(err instanceof Error ? err.message : 'Shared sign-in failed'))
        .finally(() => setAuthorizing(false));
    });
  }, [hydrateWithToken]);

  const authorizeWithDeriv = useCallback(() => {
    setError('');
    void startDerivOAuthLogin().catch(err => {
      setError(err instanceof Error ? err.message : 'Unable to start OAuth');
    });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    api?.disconnect();
    setApi(null);
    setToken('');
    setLoginid('');
    setBalance(null);
  }, [api]);

  const refreshBalance = useCallback(async () => {
    if (!api) return;
    const bal = await api.balance();
    setBalance(bal.balance);
    setCurrency(bal.currency || currency);
  }, [api, currency]);

  const value: AuthState = {
    ready,
    authorizing,
    token,
    loginid,
    balance,
    currency,
    error,
    api,
    authorizeWithDeriv,
    logout,
    refreshBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
