import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp,
  Equal,
  Hash,
  Sparkles,
  Split,
  ChevronsUp,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { getBrandCopy } from '@/config/branding';
import type { TenantConfig } from '@/config/tenant';
import { useAuth } from '@/hooks/useAuth';
import {
  TradingEngine,
  type ContractMode,
  type EngineState,
  type RiskTier,
} from '@/lib/trading-engine';

const SYMBOL = 'R_100';

type Tier = 'free' | 'premium' | 'ultra';

type Strategy = { id: string; label: string; hint: string };

const FREE_MODES: Array<{ id: ContractMode; label: string; Icon: typeof Hash; recommended?: boolean }> = [
  { id: 'RISE_FALL', label: 'Rise/Fall', Icon: ArrowDownUp },
  { id: 'DIGITMATCH', label: 'Digit Match', Icon: Equal },
  { id: 'UNDER3', label: 'Under 3', Icon: ArrowDown },
  { id: 'EVEN_ODD', label: 'Even/Odd', Icon: Hash },
  { id: 'OVERUNDER', label: 'Over/Under', Icon: ChevronsUp, recommended: true },
  { id: 'OVER6', label: 'Over 6', Icon: ArrowUp },
];

const PREMIUM_MODES: Array<{ id: ContractMode; label: string; Icon: typeof Hash; recommended?: boolean }> = [
  { id: 'RISE_FALL', label: 'Rise/Fall', Icon: ArrowDownUp },
  { id: 'EVEN_ODD', label: 'Even/Odd', Icon: Hash },
  { id: 'DIGITMATCH', label: 'Match', Icon: Equal },
  { id: 'DIGITDIFF', label: 'Differ', Icon: Split },
  { id: 'OVERUNDER', label: 'Over/Under', Icon: ChevronsUp, recommended: true },
  { id: 'MIX', label: 'Mix', Icon: Sparkles },
];

const PREMIUM_STRATEGIES: Strategy[] = [
  { id: 'alpha', label: 'Alpha', hint: 'Momentum confirmation' },
  { id: 'quantum', label: 'Quantum', hint: 'Dual-confirmation · only enters on agreement' },
  { id: 'apex', label: 'Apex', hint: 'High-payout extremes' },
];

const ULTRA_STRATEGIES: Strategy[] = [
  { id: 'phantom', label: 'Phantom', hint: 'Stealth entries' },
  { id: 'cipher', label: 'Cipher', hint: 'Pattern decode' },
  { id: 'titan', label: 'Titan', hint: 'High-balance lanes' },
];

function StakeControl({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="nx-label">Stake size [USD]</div>
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-2">
        <button
          type="button"
          className="px-3 py-2 text-lg disabled:opacity-40"
          disabled={disabled || value <= 0.35}
          onClick={() => onChange(Number(Math.max(0.35, value - 0.5).toFixed(2)))}
        >
          −
        </button>
        <input
          className="w-full bg-transparent py-2 text-center font-mono outline-none"
          value={value}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value) || 0)}
        />
        <button
          type="button"
          className="px-3 py-2 text-lg disabled:opacity-40"
          disabled={disabled}
          onClick={() => onChange(Number((value + 0.5).toFixed(2)))}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function BotPanel({
  tier,
  tenant,
  id,
}: {
  tier: Tier;
  tenant: TenantConfig;
  id: string;
}) {
  const { token, api, currency, authorizeWithDeriv, authorizing } = useAuth();
  const copy = getBrandCopy(tenant);
  const locked = !token || !api;
  const modes = tier === 'free' ? FREE_MODES : PREMIUM_MODES;
  const strategies = tier === 'ultra' ? ULTRA_STRATEGIES : PREMIUM_STRATEGIES;
  const showStrategies = tier !== 'free';

  const [mode, setMode] = useState<ContractMode>('OVERUNDER');
  const [strategy, setStrategy] = useState(strategies[1]?.id || strategies[0]?.id || 'alpha');
  const [stake, setStake] = useState(tier === 'ultra' ? 10 : tier === 'premium' ? 3 : 1.2);
  const [optimize, setOptimize] = useState(false);
  const [risk, setRisk] = useState<RiskTier>('MEDIUM');
  const [profitTarget, setProfitTarget] = useState(tier === 'ultra' ? 10000 : 500);
  const [maxLoss, setMaxLoss] = useState(tier === 'ultra' ? 750 : 250);
  const [engineState, setEngineState] = useState<EngineState | null>(null);

  const engine = useMemo(() => (api ? new TradingEngine(api) : null), [api]);

  useEffect(() => {
    if (!engine) return;
    engine.onChange = setEngineState;
    return () => {
      engine.stop();
    };
  }, [engine]);

  const offerLeft = useMemo(() => {
    const end = Date.now() + 23 * 3600_000 + 28 * 60_000;
    return end;
  }, []);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (tier !== 'premium') return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [tier]);

  const countdown = (() => {
    const ms = Math.max(0, offerLeft - now);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  })();

  const title =
    tier === 'free'
      ? `${copy.aiName} Free`
      : tier === 'premium'
        ? `${copy.aiName} Premium`
        : `${copy.aiName} Ultra`;
  const badge =
    tier === 'free' ? 'Works on real only' : tier === 'premium' ? 'Free Premium' : 'Available for bigger stakes';

  const startLabel = locked
    ? tier === 'free'
      ? `Authorize to start ${copy.aiName}`
      : tier === 'premium'
        ? 'Authorize to unlock Premium'
        : 'Authorize to unlock Ultra'
    : engineState?.running
      ? `Stop ${copy.aiName}`
      : tier === 'free'
        ? `Run ${copy.aiName}`
        : tier === 'premium'
          ? `Run ${copy.aiName} Premium`
          : `Run ${copy.aiName} Ultra`;

  const onPrimary = async () => {
    if (locked) {
      authorizeWithDeriv();
      return;
    }
    if (!engine) return;
    if (engineState?.running) {
      engine.stop('Stopped by user');
      return;
    }
    await engine.start({
      mode,
      stake,
      currency: currency || 'USD',
      symbol: SYMBOL,
      duration: tier === 'ultra' ? 5 : 1,
      durationUnit: 't',
      risk,
      profitTarget,
      maxLoss,
      optimize,
    });
  };

  return (
    <section id={id} className="nx-card scroll-mt-24">
      {tier === 'premium' ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/40 bg-primary/5 px-3 py-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-primary">Free Premium</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Limited offer — real accounts only
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 font-mono text-xs text-sky-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
            {countdown} left
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-background"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
          }}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="nx-pill border-primary/40 text-primary">{title}</span>
        <span className="nx-pill text-muted-foreground">{badge}</span>
      </div>

      {showStrategies ? (
        <div className="mb-4">
          <div className="nx-label">Trading strategy</div>
          <div className="grid grid-cols-3 gap-2">
            {strategies.map(s => (
              <button
                key={s.id}
                type="button"
                disabled={tier === 'ultra' && locked}
                className={clsx('nx-pill w-full', strategy === s.id && 'nx-pill-active')}
                onClick={() => setStrategy(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs italic text-muted-foreground">
            * {strategies.find(s => s.id === strategy)?.hint}
          </p>
        </div>
      ) : null}

      {tier === 'free' ? (
        <div className="mb-4">
          <div className="nx-label">Contract type</div>
          <div className="grid grid-cols-3 gap-2">
            {modes.map(m => (
              <button
                key={m.id}
                type="button"
                className={clsx(
                  'nx-pill flex h-[4.5rem] w-full flex-col items-center justify-center gap-1 px-2',
                  mode === m.id && 'nx-pill-active'
                )}
                onClick={() => setMode(m.id)}
              >
                <m.Icon className="h-4 w-4" />
                <span className="text-[10px] leading-tight">{m.label}</span>
                {m.recommended ? (
                  <span className="text-[8px] font-bold uppercase opacity-80">Recommended</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-4">
        <StakeControl value={stake} onChange={setStake} disabled={engineState?.running} />
      </div>

      <div className="mb-4 flex justify-center">
        <button
          type="button"
          className={clsx('nx-pill', optimize && 'nx-pill-active')}
          onClick={() => setOptimize(v => !v)}
          disabled={engineState?.running}
        >
          • {optimize ? 'Optimization on' : 'Enable Optimization'}
        </button>
      </div>

      {tier !== 'free' ? (
        <div className="mb-4">
          <div className="nx-label">Trade mode * High-payout extremes</div>
          <div className="grid grid-cols-3 gap-2">
            {modes.map(m => (
              <button
                key={m.id}
                type="button"
                disabled={tier === 'ultra' && locked}
                className={clsx(
                  'nx-pill flex h-[4.5rem] w-full flex-col items-center justify-center gap-1 px-2',
                  mode === m.id && 'nx-pill-active'
                )}
                onClick={() => setMode(m.id)}
              >
                <m.Icon className="h-4 w-4" />
                <span className="text-[10px] leading-tight">{m.label}</span>
                {m.recommended ? (
                  <span className="text-[8px] font-bold uppercase opacity-80">Recommended</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-4">
        <div className="nx-label">Risk level</div>
        <div className="grid grid-cols-3 gap-2">
          {(['LOW', 'MEDIUM', 'HIGH'] as RiskTier[]).map(r => (
            <button
              key={r}
              type="button"
              className={clsx('nx-pill w-full', risk === r && 'nx-pill-active')}
              onClick={() => setRisk(r)}
              disabled={engineState?.running || (tier === 'ultra' && locked)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <label>
          <span className="nx-label">Profit target USD</span>
          <input
            className="nx-input"
            type="number"
            value={profitTarget}
            disabled={engineState?.running || (tier === 'ultra' && locked)}
            onChange={e => setProfitTarget(Number(e.target.value) || 0)}
            placeholder={tier === 'ultra' ? '10000' : '500'}
          />
        </label>
        <label>
          <span className="nx-label">Maximum loss USD</span>
          <input
            className="nx-input"
            type="number"
            value={maxLoss}
            disabled={engineState?.running || (tier === 'ultra' && locked)}
            onChange={e => setMaxLoss(Number(e.target.value) || 0)}
            placeholder={tier === 'ultra' ? '750' : '250'}
          />
        </label>
      </div>

      <button
        type="button"
        className="nx-btn-primary"
        disabled={authorizing}
        onClick={() => void onPrimary()}
      >
        {authorizing ? 'Connecting…' : startLabel}
      </button>

      {engineState ? (
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] text-muted-foreground">
          <div className="rounded-xl border border-white/[0.04] bg-black/40 p-2">
            <div className="text-muted-foreground/70">PnL</div>
            <div className="font-mono text-primary">{engineState.pnl.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border border-white/[0.04] bg-black/40 p-2">
            <div className="text-muted-foreground/70">Trades</div>
            <div className="font-mono text-foreground">{engineState.trades}</div>
          </div>
          <div className="rounded-xl border border-white/[0.04] bg-black/40 p-2">
            <div className="text-muted-foreground/70">Wins</div>
            <div className="font-mono text-emerald-400">{engineState.wins}</div>
          </div>
          <div className="rounded-xl border border-white/[0.04] bg-black/40 p-2">
            <div className="text-muted-foreground/70">Losses</div>
            <div className="font-mono text-rose-400">{engineState.losses}</div>
          </div>
          <div className="col-span-4 rounded-xl border border-white/[0.04] bg-black/40 p-2 text-left text-muted-foreground">
            {engineState.lastMessage}
          </div>
        </div>
      ) : null}

      {!tenant.appId ? (
        <p className="mt-3 text-xs text-amber-200/80">
          Deploy via Denara Sites so a Deriv App ID and OAuth redirect are assigned automatically.
        </p>
      ) : null}
    </section>
  );
}
