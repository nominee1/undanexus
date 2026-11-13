import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Cloud,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { CommunityButton, SocialLinks } from '@/components/SocialLinks';
import { getBrandCopy } from '@/config/branding';
import { applyTenantTheme, getTenantConfig } from '@/config/tenant';
import { useAuth } from '@/hooks/useAuth';

function RadarBg() {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-1/2 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/3 text-primary/30"
      viewBox="0 0 1200 1200"
      fill="none"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="0.5" fill="none">
        <circle cx="600" cy="600" r="120" />
        <circle cx="600" cy="600" r="240" />
        <circle cx="600" cy="600" r="360" />
        <circle cx="600" cy="600" r="480" />
        <circle cx="600" cy="600" r="580" />
        <line x1="0" y1="600" x2="1200" y2="600" />
        <line x1="600" y1="0" x2="600" y2="1200" />
        <line x1="176" y1="176" x2="1024" y2="1024" />
        <line x1="1024" y1="176" x2="176" y2="1024" />
      </g>
    </svg>
  );
}

/** Per-letter line matching Digits Options hero treatment. */
function LetterLine({ text }: { text: string }) {
  return (
    <span className="inline-block" style={{ fontSize: 'clamp(1.6rem, 8.2vw, 3.5rem)' }}>
      {text.split('').map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className={ch === ' ' ? 'inline-block mr-[0.15em]' : 'inline-block'}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

function buildFaqs(aiName: string, brandName: string) {
  return [
    {
      q: `What exactly is ${aiName}?`,
      a: `${aiName} is an automated trading bot that connects to your Deriv account via OAuth 2.0 and trades Volatility Index options on your behalf 24/7 on ${brandName}.`,
    },
    {
      q: `I can't connect my Deriv account, what's the issue?`,
      a: `Make sure you complete Deriv's official OAuth 2.0 flow in the same browser tab. If login expired, tap Authorize again — PKCE verifiers only last a few minutes.`,
    },
    {
      q: `What do I do next after authorizing my Deriv account?`,
      a: `Open the ${aiName} dashboard, pick Free / Premium / Ultra, set stake and risk, then tap Run. You can stop anytime.`,
    },
    {
      q: `How do I use ${aiName}?`,
      a: `1) Sign in with Deriv. 2) Scroll to the ${aiName} Free card. 3) Choose a contract type and risk. 4) Tap Run.`,
    },
    {
      q: `How do I use ${aiName} Premium?`,
      a: `${aiName} Premium unlocks smarter strategies and higher stake lanes. Authorize, pick Alpha / Quantum / Apex, then Run Premium.`,
    },
    {
      q: `How much do I need in my Deriv account to start trading using ${aiName}?`,
      a: `Start with an amount you can afford to lose. Use profit target and max loss on every session.`,
    },
    {
      q: `Is ${brandName} a broker or investment firm?`,
      a: `No. ${brandName} provides automation tools that trade on your own Deriv account. Deriv remains the broker.`,
    },
  ];
}

const FEATURES: Array<{ label: string; Icon: typeof Zap }> = [
  { label: 'Unlimited live trades', Icon: Zap },
  { label: 'Adaptive risk engine', Icon: ShieldCheck },
  { label: 'Priority support', Icon: Sparkles },
  { label: 'Active 24/7', Icon: Activity },
  { label: 'Real-time analysis', Icon: Activity },
  { label: 'Cloud-powered', Icon: Cloud },
];

export function Landing() {
  const tenant = getTenantConfig();
  const copy = getBrandCopy(tenant);
  const { authorizeWithDeriv, authorizing, token, error } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showMoreFaq, setShowMoreFaq] = useState(false);
  const offerEnds = useMemo(() => Date.now() + 23 * 3600_000 + 11 * 60_000, []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    applyTenantTheme(tenant.themeColor);
    document.title = copy.title;
  }, [tenant.themeColor, copy.title]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (token) navigate('/nexusai', { replace: true });
  }, [token, navigate]);

  const left = Math.max(0, offerEnds - now);
  const hours = Math.floor(left / 3600000);
  const mins = Math.floor((left % 3600000) / 60000);

  const faqs = buildFaqs(copy.aiName, copy.brandName);
  const visibleFaqs = showMoreFaq ? faqs : faqs.slice(0, 7);

  const goDashboard = () => {
    if (token) navigate('/nexusai');
    else authorizeWithDeriv();
  };

  const brandParts = copy.brandName.split(/\s+/);
  const brandHead = brandParts[0] || copy.brandName;
  const brandTail = brandParts.slice(1).join(' ') || 'AI';

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-foreground selection:bg-primary/30">
      {/* Full-width fixed header + hanging offer (matches live site) */}
      <div className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="relative flex h-[70px] w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-black text-background"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                }}
              >
                {copy.brandName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-bold uppercase tracking-wide">
              {brandHead} <span className="text-primary">{brandTail}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <CommunityButton tenant={tenant} />
            <button
              type="button"
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-primary/40 text-foreground"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Open menu"
            >
              {menuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/[0.04] bg-black/95 px-4 py-4 sm:px-6 lg:px-8">
            <SocialLinks tenant={tenant} />
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <a href="#meet" className="hover:text-foreground">
                About
              </a>
              <a href="#faq" className="hover:text-foreground">
                FAQ
              </a>
              {tenant.supportEmail ? (
                <a href={`mailto:${tenant.supportEmail}`} className="hover:text-foreground">
                  Support
                </a>
              ) : null}
              <Link to="/nexusai" className="hover:text-foreground">
                Dashboard
              </Link>
            </div>
          </div>
        ) : null}

        {offerOpen ? (
          <div className="pointer-events-none absolute inset-x-0 top-[calc(100%+0.75rem)] flex justify-center px-4">
            <div className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-400/25 bg-[#0f0900]/90 shadow-lg shadow-amber-900/20 ring-1 ring-inset ring-amber-400/10 backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
              <button
                type="button"
                aria-label="Dismiss offer banner"
                className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-white/40 hover:text-white/80"
                onClick={() => setOfferOpen(false)}
              >
                <X className="h-2.5 w-2.5" />
              </button>
              <div className="flex flex-col items-center gap-1 px-4 py-2 pr-9 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded border border-amber-400/35 bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-amber-300">
                    <Sparkles className="h-2 w-2" />
                    Limited offer
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="max-w-[34rem] text-[9.5px] font-mono font-semibold leading-snug tracking-tight text-white/75 sm:text-[11.5px] sm:tracking-wide">
                    <span className="font-black text-violet-300">{copy.aiName} FREE</span> and{' '}
                    <span className="font-black text-purple-300">ULTRA</span> are free for lifetime.{' '}
                    <span className="font-black text-amber-300">{copy.aiName} Premium</span> is free for
                    a limited time.
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-1 font-mono text-[11px] text-sky-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                    {hours}h {mins}m left
                  </span>
                  <button
                    type="button"
                    onClick={goDashboard}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-black transition-colors hover:bg-amber-300"
                  >
                    Claim now
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Hero — full-bleed black, content max-w-3xl */}
      <section
        className={`relative overflow-hidden bg-black pb-6 md:pb-8 ${
          offerOpen ? 'pt-44 md:pt-56' : 'pt-32 md:pt-44'
        }`}
      >
        <RadarBg />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18),transparent_70%)] opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(245,158,11,0.08)_0%,transparent_40%,transparent_60%,rgba(168,85,247,0.08)_100%)]" />

        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <div className="flex flex-col items-start text-left">
            <h1 className="mb-2 text-[2rem] font-bold leading-[1.05] tracking-tight sm:text-5xl md:mb-4 md:text-6xl">
              One-click
              <br />
              <LetterLine text="Deriv Options Trading" />
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Platform
              </span>
            </h1>

            <p className="mb-2.5 text-sm italic text-muted-foreground sm:text-base md:mb-10">
              <span className="font-mono not-italic text-primary">Deriv</span> trading simplified with
              intelligent, automated tools and strategies.
            </p>

            <div className="mb-2 h-[1em] self-center whitespace-nowrap font-mono text-[11px] tracking-[0.12em] text-muted-foreground md:mb-3">
              <span>START TRADING DERIV OPTIONS WITH {copy.aiName.toUpperCase()}</span>
            </div>

            <div className="flex w-full max-w-md flex-col gap-4">
              <div className="group relative">
                <div className="pointer-events-none absolute -inset-8 rounded-[44px] bg-[radial-gradient(ellipse_at_center,rgba(253,224,71,0.95),rgba(250,204,21,0.7)_35%,rgba(245,158,11,0.4)_60%,transparent_80%)] opacity-85 blur-3xl" />
                <div className="relative rounded-[28px] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(245,158,11,0.6),rgba(168,85,247,0.4),rgba(34,211,238,0.4),rgba(245,158,11,0.6))] p-[1.5px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                  <div className="relative overflow-hidden rounded-[26px] bg-[#0a0a0f] p-4 sm:p-6 md:p-7">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-[0.012] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(245,158,11,0.08)_0%,transparent_40%,transparent_60%,rgba(168,85,247,0.08)_100%)]"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[140%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18),transparent_70%)]"
                    />

                    <div className="relative mb-2 flex items-center justify-between md:mb-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1">
                        <span className="relative flex h-2 w-2">
                          <span className="relative h-2 w-2 rounded-full bg-primary" />
                        </span>
                        <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary">
                          AI POWERED
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1">
                        <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-accent">
                          FLAGSHIP MODEL
                        </span>
                      </div>
                    </div>

                    <div className="relative mb-2 flex items-start gap-3 md:mb-4">
                      <div className="relative shrink-0">
                        <div
                          aria-hidden
                          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-25 blur-md"
                        />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/70 via-amber-500/70 to-accent/70 shadow-lg shadow-primary/20 ring-1 ring-white/10">
                          <Sparkles className="h-7 w-7 text-background" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="mb-1.5 bg-gradient-to-r from-foreground via-amber-100 to-primary bg-clip-text text-2xl font-black leading-none tracking-tight text-transparent">
                          {copy.aiName}
                        </div>
                        <p className="text-sm text-muted-foreground">Always live, always executing</p>
                      </div>
                    </div>

                    <div className="relative mb-2 grid grid-cols-3 rounded-xl border border-border/40 bg-background/50 p-1.5 backdrop-blur-sm md:mb-4 md:p-2.5">
                      {[
                        ['12.5M+', 'Trades'],
                        ['24/7', 'Uptime'],
                        ['<50ms', 'Latency'],
                      ].map(([v, l], i) => (
                        <div
                          key={l}
                          className={`px-1 text-center ${i < 2 ? 'border-r border-white/15' : ''}`}
                        >
                          <div className="mb-1 font-mono text-sm font-bold leading-none text-primary">
                            {v}
                          </div>
                          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                            {l}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="relative mb-3 text-sm text-muted-foreground md:mb-4">
                      Sign in with Deriv using{' '}
                      <span className="rounded border border-primary/40 bg-primary/5 px-1.5 py-0.5 font-mono text-[11px] text-primary">
                        OAuth 2.0
                      </span>{' '}
                      and let {copy.aiCompact} handle the trading.
                      <span className="mt-1 block text-xs text-muted-foreground/70">
                        one secure click, no password stored
                      </span>
                    </p>

                    <ul className="relative mb-3 grid grid-cols-2 gap-x-3 gap-y-1 md:mb-5 md:gap-y-1.5">
                      {FEATURES.map(({ label, Icon }) => (
                        <li
                          key={label}
                          className="flex items-center gap-2 text-xs text-muted-foreground/90"
                        >
                          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/15">
                            <Icon className="h-2.5 w-2.5 text-primary" strokeWidth={2.5} />
                          </span>
                          <span className="leading-snug">{label}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className="group relative w-full overflow-hidden rounded-xl"
                      disabled={authorizing}
                      onClick={goDashboard}
                    >
                      <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-amber-500 to-accent px-4 py-3 font-mono text-sm font-bold text-background">
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                        <Zap className="relative h-3.5 w-3.5" strokeWidth={2.5} />
                        <span className="relative tracking-[0.12em]">
                          {authorizing ? 'CONNECTING…' : `ACCESS ${copy.aiName.toUpperCase()}`}
                        </span>
                        <ChevronRight className="relative h-3.5 w-3.5" />
                      </div>
                    </button>

                    {error ? <p className="relative mt-3 text-sm text-rose-300">{error}</p> : null}
                  </div>
                </div>
              </div>

              {tenant.partnersUrl ? (
                <a
                  href={tenant.partnersUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative mt-2.5 inline-flex items-center gap-1 self-center whitespace-nowrap rounded-full border border-primary/25 bg-primary/5 py-1.5 pl-2.5 pr-2 font-mono text-xs tracking-[0.3px] text-muted-foreground transition hover:border-primary/50 hover:bg-primary/10 md:mt-4 sm:gap-1.5"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                  <span>Don&apos;t have a Deriv account?</span>
                  <span className="font-semibold text-primary">Register here</span>
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary/30 bg-primary/15 transition-colors group-hover:bg-primary group-hover:text-background">
                    <ChevronRight className="h-2.5 w-2.5" />
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Meet — full width, inner max-w-6xl */}
      <section
        id="meet"
        className="relative scroll-mt-20 overflow-hidden bg-black pb-8 pt-10"
      >
        <div className="relative mx-auto max-w-6xl px-4">
          <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            Meet {copy.aiName}
          </p>
          <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Your always-on trading engine for Deriv.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            {copy.aiCompact} is the brain behind {copy.brandName}, a fully automated bot that analyzes
            live tick data from your favourite Volatility Indices, identifies high-probability trading
            opportunities, and executes trades on your Deriv account within the limits you set. No
            manual monitoring, no indicators to configure. You set the rules, {copy.aiCompact} handles
            the rest.
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 md:grid-cols-3">
            {[
              {
                title: 'Sign in with Deriv',
                body: `Authenticate securely via Deriv's official OAuth 2.0 flow. No credentials are ever stored on our servers. Grant scoped access in seconds and revoke it at any time directly from your Deriv account settings.`,
              },
              {
                title: 'Choose your plan',
                body: `Select a subscription tier that suits your trading goals. Once active, engage the engine with a single click. ${copy.aiCompact} continuously analyses live market conditions and executes positions on your Deriv account.`,
              },
              {
                title: 'Monitor performance',
                body: 'Every executed position is reflected instantly across your dashboard. Profit, win rate, and account balance update in real time. Pause or terminate the engine at any point with a single action, no delays.',
              },
            ].map(card => (
              <button
                key={card.title}
                type="button"
                onClick={goDashboard}
                className="rounded-2xl border border-white/[0.06] bg-[#0a0a0f] p-4 text-left transition hover:border-primary/30 hover:bg-[#0d0d12]"
              >
                <h3 className="text-sm font-bold uppercase tracking-wide">{card.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{card.body}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — full width */}
      <section
        id="faq"
        className="relative scroll-mt-20 overflow-hidden border-t border-border/50 bg-black py-8 md:py-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background opacity-30" />
        <div className="relative mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">
            Got questions? We have answers.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
            Everything you need to know about {copy.aiCompact}, subscriptions, and how trading works on{' '}
            {copy.brandName}.
          </p>
          <div className="mt-6 space-y-2">
            {visibleFaqs.map((item, idx) => {
              const open = openFaq === idx;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f]"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    aria-expanded={open}
                  >
                    <span>
                      <span className="mr-2 font-mono text-primary/70">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {item.q}
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open ? (
                    <p className="border-t border-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
            {!showMoreFaq ? (
              <button
                type="button"
                className="nx-pill mx-auto mt-2"
                onClick={() => setShowMoreFaq(true)}
              >
                Show more questions
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-black px-4 py-10 text-center">
        <p className="text-sm font-bold uppercase tracking-wide">
          {brandHead} <span className="text-primary">{brandTail}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{copy.tagline}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <a href="#meet" className="hover:text-foreground">
            About
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
          {tenant.supportEmail ? (
            <a href={`mailto:${tenant.supportEmail}`} className="hover:text-foreground">
              Support
            </a>
          ) : null}
        </div>
        <div className="mt-4">
          <SocialLinks tenant={tenant} />
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-[11px] leading-relaxed text-muted-foreground/60">
          Risk disclaimer: Deriv offers complex derivatives, such as options and contracts for
          difference (“CFDs”). These products may not be suitable for all clients, and trading them
          puts your capital at risk.
        </p>
      </footer>
    </div>
  );
}
