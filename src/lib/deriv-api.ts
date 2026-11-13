type Pending = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

const DEFAULT_ENDPOINT = 'wss://ws.derivws.com/websockets/v3';

export class DerivApi {
  private ws: WebSocket | null = null;
  private reqId = 1;
  private pending = new Map<number, Pending>();
  private authorizedToken: string | null = null;
  private appId: string;

  constructor(appId: string) {
    this.appId = appId;
  }

  get isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async connect(): Promise<void> {
    if (this.isOpen) return;
    if (!this.appId) throw new Error('Deriv App ID is not configured for this site.');

    await new Promise<void>((resolve, reject) => {
      const url = `${DEFAULT_ENDPOINT}?app_id=${encodeURIComponent(this.appId)}`;
      const ws = new WebSocket(url);
      this.ws = ws;

      const timer = window.setTimeout(() => {
        reject(new Error('Deriv WebSocket connection timed out.'));
        ws.close();
      }, 12000);

      ws.onopen = () => {
        window.clearTimeout(timer);
        resolve();
      };
      ws.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error('Deriv WebSocket connection failed.'));
      };
      ws.onmessage = event => this.onMessage(String(event.data));
      ws.onclose = () => {
        for (const [, p] of this.pending) p.reject(new Error('Socket closed'));
        this.pending.clear();
      };
    });
  }

  private onMessage(raw: string) {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }
    const reqId = Number(data.req_id);
    if (!reqId || !this.pending.has(reqId)) return;
    const pending = this.pending.get(reqId)!;
    this.pending.delete(reqId);
    if (data.error) {
      const err = data.error as { message?: string };
      pending.reject(new Error(err.message || 'Deriv API error'));
      return;
    }
    pending.resolve(data);
  }

  async send<T = Record<string, unknown>>(payload: Record<string, unknown>): Promise<T> {
    await this.connect();
    const req_id = this.reqId++;
    const body = { ...payload, req_id };
    return new Promise<T>((resolve, reject) => {
      this.pending.set(req_id, {
        resolve: value => resolve(value as T),
        reject,
      });
      this.ws!.send(JSON.stringify(body));
    });
  }

  async authorize(token: string) {
    const res = await this.send<{ authorize: { loginid: string; balance: number; currency: string; fullname?: string } }>({
      authorize: token,
    });
    this.authorizedToken = token;
    return res.authorize;
  }

  get token() {
    return this.authorizedToken;
  }

  async balance() {
    const res = await this.send<{ balance: { balance: number; currency: string } }>({ balance: 1 });
    return res.balance;
  }

  async proposal(input: {
    amount: number;
    basis?: 'stake' | 'payout';
    contract_type: string;
    currency: string;
    duration: number;
    duration_unit: 't' | 's' | 'm';
    symbol: string;
    barrier?: string;
  }) {
    return this.send<{
      proposal: { id: string; ask_price: number; payout: number; spot?: number };
      echo_req: Record<string, unknown>;
    }>({
      proposal: 1,
      ...input,
    });
  }

  async buy(price: number, proposalId: string) {
    return this.send<{ buy: { contract_id: number; buy_price: number; balance_after: number } }>({
      buy: proposalId,
      price,
    });
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.authorizedToken = null;
  }
}
