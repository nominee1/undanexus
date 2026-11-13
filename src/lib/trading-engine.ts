import type { DerivApi } from './deriv-api';

export type ContractMode =
  | 'RISE_FALL'
  | 'EVEN_ODD'
  | 'DIGITMATCH'
  | 'DIGITDIFF'
  | 'OVERUNDER'
  | 'UNDER3'
  | 'OVER6'
  | 'MIX';

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';

export type EngineConfig = {
  mode: ContractMode;
  stake: number;
  currency: string;
  symbol: string;
  duration: number;
  durationUnit: 't' | 's' | 'm';
  risk: RiskTier;
  profitTarget: number;
  maxLoss: number;
  optimize: boolean;
};

export type EngineState = {
  running: boolean;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  lastMessage: string;
};

const MODE_CONTRACT: Record<ContractMode, { contract_type: string; barrier?: string }> = {
  RISE_FALL: { contract_type: 'CALL' },
  EVEN_ODD: { contract_type: 'DIGITEVEN' },
  DIGITMATCH: { contract_type: 'DIGITMATCH', barrier: '5' },
  DIGITDIFF: { contract_type: 'DIGITDIFF', barrier: '5' },
  OVERUNDER: { contract_type: 'DIGITOVER', barrier: '4' },
  UNDER3: { contract_type: 'DIGITUNDER', barrier: '3' },
  OVER6: { contract_type: 'DIGITOVER', barrier: '6' },
  MIX: { contract_type: 'CALL' },
};

function stakeForRisk(base: number, risk: RiskTier, optimize: boolean) {
  const mult = risk === 'HIGH' ? 1.35 : risk === 'MEDIUM' ? 1.1 : 0.85;
  const optimized = optimize ? mult * 1.05 : mult;
  return Math.max(0.35, Number((base * optimized).toFixed(2)));
}

function alternateMix(trades: number): ContractMode {
  return trades % 2 === 0 ? 'OVERUNDER' : 'RISE_FALL';
}

async function waitForContractResult(api: DerivApi, contractId: number, timeoutMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const res = await api.send<{
      proposal_open_contract: {
        is_sold?: number;
        is_expired?: number;
        profit?: number;
        status?: string;
      };
    }>({
      proposal_open_contract: 1,
      contract_id: contractId,
    });
    const poc = res.proposal_open_contract;
    if (poc.is_sold || poc.is_expired || poc.status === 'sold' || typeof poc.profit === 'number') {
      return Number(poc.profit ?? 0);
    }
    await new Promise(r => setTimeout(r, 900));
  }
  throw new Error('Contract result timed out');
}

export class TradingEngine {
  private api: DerivApi;
  private timer: number | null = null;
  private stopped = true;
  state: EngineState = {
    running: false,
    pnl: 0,
    trades: 0,
    wins: 0,
    losses: 0,
    lastMessage: 'Idle',
  };
  onChange: ((state: EngineState) => void) | null = null;

  constructor(api: DerivApi) {
    this.api = api;
  }

  private emit(patch: Partial<EngineState>) {
    this.state = { ...this.state, ...patch };
    this.onChange?.(this.state);
  }

  stop(message = 'Stopped') {
    this.stopped = true;
    this.state.running = false;
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    this.emit({ running: false, lastMessage: message });
  }

  async start(config: EngineConfig) {
    this.stop('Starting…');
    this.stopped = false;
    this.emit({ running: true, lastMessage: 'Bot running…', pnl: 0, trades: 0, wins: 0, losses: 0 });

    const loop = async () => {
      if (this.stopped) return;
      if (config.profitTarget > 0 && this.state.pnl >= config.profitTarget) {
        this.stop(`Profit target hit (+${this.state.pnl.toFixed(2)})`);
        return;
      }
      if (config.maxLoss > 0 && this.state.pnl <= -Math.abs(config.maxLoss)) {
        this.stop(`Max loss reached (${this.state.pnl.toFixed(2)})`);
        return;
      }

      try {
        const mode = config.mode === 'MIX' ? alternateMix(this.state.trades) : config.mode;
        const spec = MODE_CONTRACT[mode];
        const amount = stakeForRisk(config.stake, config.risk, config.optimize);
        this.emit({ lastMessage: `Proposing ${mode} · ${amount} ${config.currency}` });
        const proposal = await this.api.proposal({
          amount,
          basis: 'stake',
          contract_type: spec.contract_type,
          currency: config.currency,
          duration: config.duration,
          duration_unit: config.durationUnit,
          symbol: config.symbol,
          barrier: spec.barrier,
        });
        const ask = proposal.proposal.ask_price;
        this.emit({ lastMessage: `Buying @ ${ask.toFixed(2)}` });
        const buy = await this.api.buy(ask, proposal.proposal.id);
        const contractId = buy.buy.contract_id;
        this.emit({ lastMessage: `Waiting on contract #${contractId}` });
        const profit = await waitForContractResult(this.api, contractId);
        const won = profit >= 0;
        this.emit({
          trades: this.state.trades + 1,
          wins: this.state.wins + (won ? 1 : 0),
          losses: this.state.losses + (won ? 0 : 1),
          pnl: Number((this.state.pnl + profit).toFixed(2)),
          lastMessage: won ? `Win +${profit.toFixed(2)}` : `Loss ${profit.toFixed(2)}`,
          running: true,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Trade failed';
        this.emit({ lastMessage: message, running: true });
      }

      if (!this.stopped) {
        this.timer = window.setTimeout(() => {
          void loop();
        }, 1200);
      }
    };

    void loop();
  }
}
