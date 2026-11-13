import { LogIn } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BotPanel } from '@/components/BotPanel';
import { Header } from '@/components/Header';
import { SocialLinks } from '@/components/SocialLinks';
import { getBrandCopy } from '@/config/branding';
import { applyTenantTheme, getTenantConfig } from '@/config/tenant';
import { useAuth } from '@/hooks/useAuth';

export function Dashboard() {
  const tenant = getTenantConfig();
  const copy = getBrandCopy(tenant);
  const { authorizeWithDeriv, authorizing, token, error, ready } = useAuth();

  useEffect(() => {
    applyTenantTheme(tenant.themeColor);
    document.title = `${copy.aiName} | Trading Dashboard`;
  }, [tenant.themeColor, copy.aiName]);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace(/^#/, '').split('?')[0];
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header tenant={tenant} />
      <main className="nx-shell space-y-6">
        <section className="pt-4 text-center">
          <div className="mb-3">
            <Link to="/" className="nx-pill text-muted-foreground">
              ← Back
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-foreground via-amber-100 to-primary bg-clip-text text-transparent">
              {copy.aiName}
            </span>{' '}
            <span className="text-foreground">| Trading Dashboard</span>
          </h1>

          {tenant.partnersUrl ? (
            <a
              href={tenant.partnersUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full border border-primary/30 bg-primary/5 px-4 py-2 font-mono text-sm text-primary"
            >
              Don&apos;t have a Deriv account? Register here →
            </a>
          ) : null}

          {!token ? (
            <div className="mt-6">
              <button
                type="button"
                className="nx-btn-primary mx-auto max-w-md"
                disabled={!ready || authorizing}
                onClick={authorizeWithDeriv}
              >
                <LogIn className="h-4 w-4" />
                {authorizing ? 'CONNECTING…' : 'AUTHORIZE WITH DERIV'}
                <span className="block text-[10px] font-semibold tracking-normal opacity-80">
                  2.0 OAuth Secure
                </span>
              </button>
              <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Trade with {copy.aiName} Free
              </p>
            </div>
          ) : null}

          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </section>

        <BotPanel tier="free" tenant={tenant} id="nexus-trial-bot" />
        <BotPanel tier="premium" tenant={tenant} id="nexus-premium-bot" />
        <BotPanel tier="ultra" tenant={tenant} id="nexus-ultra-bot" />

        <section className="nx-card text-center">
          <h2 className="text-lg font-bold uppercase tracking-wide">{copy.brandName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow us for updates and trading insights.
          </p>
          <div className="mt-4">
            <SocialLinks tenant={tenant} />
          </div>
          {tenant.supportEmail ? (
            <a
              className="mt-4 inline-block text-sm text-primary"
              href={`mailto:${tenant.supportEmail}`}
            >
              Contact Support
            </a>
          ) : null}
          {!tenant.social.telegramUrl &&
          !tenant.social.whatsappUrl &&
          !tenant.supportEmail ? (
            <p className="mt-3 text-xs text-muted-foreground/60">
              Add Telegram, WhatsApp, or a support email in your Denara Sites deploy settings.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
