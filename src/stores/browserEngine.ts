import type {
  Asset,
  Candle,
  GameModeConfig,
  GameModeType,
  NewsItem,
  OrderBook,
  OrderLevel,
  OrderSide,
  OrderType,
  PortfolioSummary,
  RankId,
  RankInfo,
  Transaction,
} from '../types';
import { ProceduralNewsGenerator } from '../utils/proceduralNews';

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown; __TAURI__?: unknown }).__TAURI_INTERNALS__ || (window as unknown as { __TAURI__?: unknown }).__TAURI__);
}

export function computeRank(netWorth: number): RankInfo {
  if (netWorth < 15000) {
    const progress = Math.min(100, Math.max(0, (netWorth / 15000) * 100));
    return {
      id: 'RetailNoob' as RankId,
      title: 'Retail Noob',
      min_threshold: 0,
      max_threshold: 15000,
      badge_color: '#6b7280',
      perk_description: 'Base trading fee: 0.25%. Limited bank loan lines.',
      progress_pct: progress,
      next_tier_needed: Math.max(0, 15000 - netWorth),
    };
  } else if (netWorth < 50000) {
    const progress = Math.min(100, Math.max(0, ((netWorth - 15000) / 35000) * 100));
    return {
      id: 'DayTraderKids' as RankId,
      title: 'Day Trader Kids',
      min_threshold: 15000,
      max_threshold: 50000,
      badge_color: '#3b82f6',
      perk_description: 'Unlocked 2x Margin trading and 0.20% fee rebate.',
      progress_pct: progress,
      next_tier_needed: Math.max(0, 50000 - netWorth),
    };
  } else if (netWorth < 250000) {
    const progress = Math.min(100, Math.max(0, ((netWorth - 50000) / 200000) * 100));
    return {
      id: 'WallStreetWannabe' as RankId,
      title: 'Wall Street Wannabe',
      min_threshold: 50000,
      max_threshold: 250000,
      badge_color: '#10b981',
      perk_description: 'Bank credit line up to $100,000. Early insider rumor alerts.',
      progress_pct: progress,
      next_tier_needed: Math.max(0, 250000 - netWorth),
    };
  } else if (netWorth < 1000000) {
    const progress = Math.min(100, Math.max(0, ((netWorth - 250000) / 750000) * 100));
    return {
      id: 'MarketChad' as RankId,
      title: 'Market Chad',
      min_threshold: 250000,
      max_threshold: 1000000,
      badge_color: '#f59e0b',
      perk_description: 'VIP Dark Pool execution. 0.08% maker fee.',
      progress_pct: progress,
      next_tier_needed: Math.max(0, 1000000 - netWorth),
    };
  } else if (netWorth < 10000000) {
    const progress = Math.min(100, Math.max(0, ((netWorth - 1000000) / 9000000) * 100));
    return {
      id: 'CryptoWhale' as RankId,
      title: 'Crypto Whale',
      min_threshold: 1000000,
      max_threshold: 10000000,
      badge_color: '#a855f7',
      perk_description: 'Market-moving volume capacity. Priority pump alerts.',
      progress_pct: progress,
      next_tier_needed: Math.max(0, 10000000 - netWorth),
    };
  } else {
    return {
      id: 'WallStreetLegend' as RankId,
      title: 'Wall Street Legend',
      min_threshold: 10000000,
      max_threshold: null,
      badge_color: '#00f796',
      perk_description: 'Master of Markets. Infinite borrowing lines and zero fees.',
      progress_pct: 100,
      next_tier_needed: 0,
    };
  }
}

export class BrowserSimulationEngine {
  assets: Asset[] = [];
  config: GameModeConfig;
  portfolio: PortfolioSummary;
  newsHistory: NewsItem[] = [];
  lastNewsTime = 0;
  elapsedSeconds = 0;

  constructor(mode: GameModeType = 'Cryptocurrency', customConfig?: Partial<GameModeConfig>) {
    this.config = this.createConfig(mode, customConfig);
    this.assets = this.createInitialAssets();
    this.portfolio = {
      cash: this.config.starting_cash,
      net_worth: this.config.starting_cash,
      unrealized_pnl: 0,
      realized_pnl: 0,
      holdings: {},
      recent_transactions: [],
      rank: computeRank(this.config.starting_cash),
      bank: {
        loan_balance: 0,
        max_borrow_limit: Math.max(5000, this.config.starting_cash * 0.8),
        interest_rate_apr: 0.065,
        accumulated_dividends: 0,
      },
    };
  }

  createConfig(mode: GameModeType, custom?: Partial<GameModeConfig>): GameModeConfig {
    if (mode === 'StockExchange') {
      return {
        mode_type: 'StockExchange',
        starting_cash: 25000,
        volatility_multiplier: 0.8,
        news_frequency_secs: 35,
        enable_dividends: true,
        active_asset_ids: [
          'pear',
          'mhd',
          'tslax',
          'pixl',
          'goog',
          'mate',
          'xomm',
          'msm',
          'bae',
          'ccn',
          'ambk',
          'bcly',
        ],
        time_speed_multiplier: 1.0,
        infinite_cash: false,
      };
    } else if (mode === 'Cryptocurrency') {
      return {
        mode_type: 'Cryptocurrency',
        starting_cash: 10000,
        volatility_multiplier: 3.2,
        news_frequency_secs: 15,
        enable_dividends: false,
        active_asset_ids: ['byte', 'aeth', 'sola', 'meow', 'usdf'],
        time_speed_multiplier: 1.0,
        infinite_cash: false,
      };
    } else if (mode === 'Test') {
      return {
        mode_type: 'Test',
        starting_cash: 100000000,
        volatility_multiplier: 1.5,
        news_frequency_secs: 20,
        enable_dividends: true,
        active_asset_ids: [
          'pear',
          'mhd',
          'tslax',
          'pixl',
          'goog',
          'mate',
          'xomm',
          'msm',
          'bae',
          'ccn',
          'ambk',
          'bcly',
          'byte',
          'aeth',
          'sola',
          'meow',
          'usdf',
        ],
        time_speed_multiplier: 1.0,
        infinite_cash: true,
      };
    } else {
      return {
        mode_type: 'Custom',
        starting_cash: custom?.starting_cash ?? 50000,
        volatility_multiplier: custom?.volatility_multiplier ?? 1.5,
        news_frequency_secs: custom?.news_frequency_secs ?? 25,
        enable_dividends: true,
        active_asset_ids: custom?.active_asset_ids ?? [
          'pear',
          'mhd',
          'tslax',
          'pixl',
          'goog',
          'byte',
          'aeth',
        ],
        time_speed_multiplier: 1.0,
        infinite_cash: false,
      };
    }
  }

  createInitialAssets(): Asset[] {
    const list: Array<Omit<Asset, 'candles' | 'change_24h_pct' | 'high_24h' | 'low_24h' | 'volume_24h'> & { initialPrice: number }> = [
      { id: 'byte', symbol: 'BYTE', name: 'Bytecoin', category: 'Crypto', initialPrice: 68450.0, base_volatility: 0.025, trend_bias: 0.0, dividend_yield: 0.0, previous_close: 67200.0, current_price: 68450.0, description: 'Pioneer decentralized digital token.' },
      { id: 'aeth', symbol: 'AETH', name: 'Aethereum', category: 'Crypto', initialPrice: 3620.0, base_volatility: 0.035, trend_bias: 0.0, dividend_yield: 0.0, previous_close: 3550.0, current_price: 3620.0, description: 'Smart contract platform powering endless DeFi experiments.' },
      { id: 'sola', symbol: 'SOLA', name: 'Solona', category: 'Crypto', initialPrice: 185.50, base_volatility: 0.05, trend_bias: 0.0, dividend_yield: 0.0, previous_close: 180.0, current_price: 185.50, description: 'Ultra-fast Layer 1 with lightning throughput.' },
      { id: 'meow', symbol: 'MEOW', name: 'MeowCoin', category: 'Crypto', initialPrice: 0.1540, base_volatility: 0.095, trend_bias: 0.0, dividend_yield: 0.0, previous_close: 0.1450, current_price: 0.1540, description: 'Feline meme coin manipulated by social media influencers.' },
      { id: 'usdf', symbol: 'USDF', name: 'USD-Fake', category: 'Crypto', initialPrice: 1.0000, base_volatility: 0.003, trend_bias: 0.0, dividend_yield: 0.0, previous_close: 1.0000, current_price: 1.0000, description: 'Algorithmic stablecoin backed by trust and hope.' },
      { id: 'pear', symbol: 'PEAR', name: 'Pear Inc.', category: 'Stock', initialPrice: 224.50, base_volatility: 0.012, trend_bias: 0.0, dividend_yield: 0.016, previous_close: 221.0, current_price: 224.50, description: 'Consumer tech giant selling titanium phones.' },
      { id: 'mhd', symbol: 'MHD', name: 'MicroHard', category: 'Stock', initialPrice: 448.20, base_volatility: 0.011, trend_bias: 0.0, dividend_yield: 0.014, previous_close: 442.0, current_price: 448.20, description: 'Enterprise software titan dominating cloud & SaaS.' },
      { id: 'tslax', symbol: 'TSLA-X', name: 'MuskCar', category: 'Stock', initialPrice: 262.30, base_volatility: 0.035, trend_bias: 0.0, dividend_yield: 0.0, previous_close: 255.0, current_price: 262.30, description: 'Autonomous EV & humanoid robotics company.' },
      { id: 'pixl', symbol: 'PIXL', name: 'Nvidiot', category: 'Stock', initialPrice: 132.80, base_volatility: 0.032, trend_bias: 0.0, dividend_yield: 0.005, previous_close: 129.5, current_price: 132.80, description: 'Semiconductor monopolizer powering the AI bubble.' },
      { id: 'goog', symbol: 'GOOG', name: 'Googol', category: 'Stock', initialPrice: 178.40, base_volatility: 0.015, trend_bias: 0.0, dividend_yield: 0.008, previous_close: 175.0, current_price: 178.40, description: 'Omnipresent search and cloud AI conglomerate indexing global cyberspace.' },
      { id: 'mate', symbol: 'MATE', name: 'Mate', category: 'Stock', initialPrice: 560.20, base_volatility: 0.022, trend_bias: 0.0, dividend_yield: 0.005, previous_close: 550.0, current_price: 560.20, description: 'Social metaverse nexus connecting billions through algorithms and VR.' },
      { id: 'xomm', symbol: 'XOMM', name: 'XennonMobile', category: 'Stock', initialPrice: 118.60, base_volatility: 0.012, trend_bias: 0.0, dividend_yield: 0.034, previous_close: 116.5, current_price: 118.60, description: 'Global fossil fuel and LNG titan powering traditional industry.' },
      { id: 'msm', symbol: 'MS-M', name: 'Sergei Manly', category: 'Stock', initialPrice: 104.50, base_volatility: 0.016, trend_bias: 0.0, dividend_yield: 0.032, previous_close: 102.5, current_price: 104.50, description: 'High-flying Wall Street investment bank, wealth advisor, and underwriter.' },
      { id: 'bae', symbol: 'BA-E', name: 'Baeing', category: 'Stock', initialPrice: 154.30, base_volatility: 0.028, trend_bias: 0.0, dividend_yield: 0.000, previous_close: 151.0, current_price: 154.30, description: 'Commercial jetliner and defense manufacturer under intense fuselage scrutiny.' },
      { id: 'ccn', symbol: 'CCN', name: 'CCN', category: 'Stock', initialPrice: 42.80, base_volatility: 0.020, trend_bias: 0.0, dividend_yield: 0.025, previous_close: 41.5, current_price: 42.80, description: '24-hour global cable news and breaking media syndicate.' },
      { id: 'ambk', symbol: 'AMBK', name: 'American Bank', category: 'Stock', initialPrice: 38.50, base_volatility: 0.014, trend_bias: 0.0, dividend_yield: 0.028, previous_close: 37.8, current_price: 38.50, description: 'Commercial banking giant managing retail accounts and mortgage debt.' },
      { id: 'bcly', symbol: 'BCLY', name: 'Boreclay', category: 'Stock', initialPrice: 28.20, base_volatility: 0.017, trend_bias: 0.0, dividend_yield: 0.035, previous_close: 27.5, current_price: 28.20, description: 'Historic transatlantic corporate bank with premier credit networks.' },
    ];

    const now = Date.now();
    return list.map((item) => {
      const candles: Candle[] = [];
      let p = item.initialPrice * 0.96;
      for (let i = 15; i >= 0; i--) {
        const drift = (Math.random() - 0.48) * (p * item.base_volatility);
        const close = Math.max(0.0001, p + drift);
        const high = Math.max(p, close) * (1 + Math.random() * 0.008);
        const low = Math.min(p, close) * (1 - Math.random() * 0.008);
        candles.push({
          timestamp: now - i * 10000,
          open: p,
          high,
          low,
          close,
          volume: Math.round(p * (Math.random() * 20 + 5)),
        });
        p = close;
      }
      return {
        ...item,
        current_price: p,
        high_24h: Math.max(...candles.map((c) => c.high)),
        low_24h: Math.min(...candles.map((c) => c.low)),
        volume_24h: candles.reduce((acc, c) => acc + c.volume, 0),
        change_24h_pct: ((p - item.previous_close) / item.previous_close) * 100,
        candles,
      };
    });
  }

  tick(timeSpeed = 1.0): { assets: Asset[]; newAlert?: NewsItem } {
    const activeIds = this.config.active_asset_ids;
    this.elapsedSeconds += Math.round(1 * timeSpeed);
    const now = Date.now();

    for (const asset of this.assets) {
      if (!activeIds.includes(asset.id)) continue;

      const shock = (Math.random() * 2 - 1) * asset.base_volatility * this.config.volatility_multiplier * 0.4;
      const jump = Math.random() > 0.985 ? (Math.random() * 0.1 - 0.05) * this.config.volatility_multiplier : 0;
      const delta = shock + asset.trend_bias * 0.2 + jump;
      asset.trend_bias *= 0.92;

      const newPrice = Math.max(0.0001, asset.current_price * (1 + delta));
      asset.current_price = Math.round(newPrice * 10000) / 10000;
      asset.high_24h = Math.max(asset.high_24h, asset.current_price);
      asset.low_24h = Math.min(asset.low_24h, asset.current_price);
      asset.change_24h_pct = ((asset.current_price - asset.previous_close) / asset.previous_close) * 100;

      const lastCandle = asset.candles[asset.candles.length - 1];
      if (lastCandle && now - lastCandle.timestamp < 10000) {
        lastCandle.close = asset.current_price;
        lastCandle.high = Math.max(lastCandle.high, asset.current_price);
        lastCandle.low = Math.min(lastCandle.low, asset.current_price);
        lastCandle.volume += Math.round(asset.current_price * 2);
      } else {
        asset.candles.push({
          timestamp: now,
          open: lastCandle ? lastCandle.close : asset.current_price,
          high: asset.current_price,
          low: asset.current_price,
          close: asset.current_price,
          volume: Math.round(asset.current_price * (Math.random() * 15 + 5)),
        });
        if (asset.candles.length > 80) asset.candles.shift();
      }
    }

    // Process bank interest and stock dividends
    if (this.portfolio.bank.loan_balance > 0) {
      const yearFraction = (1 * timeSpeed) / 31536000;
      this.portfolio.bank.loan_balance += this.portfolio.bank.loan_balance * this.portfolio.bank.interest_rate_apr * yearFraction;
    }

    if (this.config.enable_dividends) {
      const yearFraction = (1 * timeSpeed) / 31536000;
      for (const [sym, holding] of Object.entries(this.portfolio.holdings)) {
        const asset = this.assets.find((a) => a.symbol === sym && a.category === 'Stock');
        if (asset && asset.dividend_yield > 0) {
          const div = holding.quantity * asset.current_price * asset.dividend_yield * yearFraction;
          this.portfolio.cash += div;
          this.portfolio.bank.accumulated_dividends += div;
        }
      }
    }

    this.updatePortfolioNetWorth();

    // Random News generator
    let newAlert: NewsItem | undefined;
    if (Math.floor(now / 1000) - this.lastNewsTime >= this.config.news_frequency_secs && Math.random() > 0.4) {
      newAlert = this.generateRandomNews(Math.floor(now / 1000));
      this.lastNewsTime = Math.floor(now / 1000);
      if (newAlert.affected_symbol) {
        const target = this.assets.find((a) => a.symbol === newAlert?.affected_symbol);
        if (target) {
          target.trend_bias += newAlert.shock_magnitude * 0.7;
          target.current_price *= 1 + newAlert.shock_magnitude;
        }
      }
      this.newsHistory.unshift(newAlert);
      if (this.newsHistory.length > 50) this.newsHistory.pop();
    }

    return {
      assets: this.assets.filter((a) => activeIds.includes(a.id)),
      newAlert,
    };
  }

  generateRandomNews(timestamp: number): NewsItem {
    return ProceduralNewsGenerator.generate(timestamp, this.config.mode_type);
  }

  getOrderBook(symbol: string): OrderBook | null {
    const asset = this.assets.find((a) => a.symbol === symbol);
    if (!asset) return null;

    const currentPrice = asset.current_price;
    const spreadPct = asset.category === 'Crypto' ? 0.12 : 0.04;
    const halfSpread = currentPrice * (spreadPct / 200);
    const bestBid = currentPrice - halfSpread;
    const bestAsk = currentPrice + halfSpread;

    const bids: OrderLevel[] = [];
    const asks: OrderLevel[] = [];
    let bidSum = 0;
    let askSum = 0;

    for (let i = 0; i < 7; i++) {
      const bPrice = Math.max(0.0001, bestBid - (i + 1) * 0.0012 * currentPrice);
      const bQty = (50 / Math.max(1, bPrice / 100)) * (1 + i * 0.3);
      bidSum += bPrice * bQty;
      bids.push({
        price: Math.round(bPrice * 10000) / 10000,
        quantity: Math.round(bQty * 1000) / 1000,
        total: Math.round(bidSum),
      });

      const aPrice = bestAsk + (i + 1) * 0.0012 * currentPrice;
      const aQty = (50 / Math.max(1, aPrice / 100)) * (1 + i * 0.3);
      askSum += aPrice * aQty;
      asks.push({
        price: Math.round(aPrice * 10000) / 10000,
        quantity: Math.round(aQty * 1000) / 1000,
        total: Math.round(askSum),
      });
    }

    return {
      asset_symbol: symbol,
      bids,
      asks,
      spread: Math.round((bestAsk - bestBid) * 10000) / 10000,
      spread_pct: spreadPct,
    };
  }

  executeTrade(symbol: string, side: OrderSide, type: OrderType, quantity: number, limitPrice?: number): Transaction {
    const asset = this.assets.find((a) => a.symbol === symbol);
    if (!asset) throw new Error(`Asset ${symbol} not found`);

    let execPrice = asset.current_price;
    if (type === 'Market') {
      execPrice *= side === 'Buy' ? 1.001 : 0.999;
    } else {
      if (!limitPrice) throw new Error('Limit price required');
      execPrice = limitPrice;
    }

    const gross = execPrice * quantity;
    const feeRate = this.portfolio.rank.id === 'WallStreetLegend' ? 0 : 0.002;
    const fee = gross * feeRate;
    const now = Math.floor(Date.now() / 1000);
    const txId = `tx-${now}-${Math.floor(Math.random() * 1000)}`;

    if (side === 'Buy') {
      const totalCost = gross + fee;
      if (!this.config.infinite_cash && this.portfolio.cash < totalCost) {
        throw new Error(`Insufficient cash. Required: $${totalCost.toFixed(2)}, Available: $${this.portfolio.cash.toFixed(2)}`);
      }
      if (!this.config.infinite_cash) {
        this.portfolio.cash -= totalCost;
      }
      const existing = this.portfolio.holdings[symbol] ?? {
        symbol,
        quantity: 0,
        average_buy_price: 0,
        total_cost_basis: 0,
      };
      const newTotalCost = existing.total_cost_basis + gross;
      const newQty = existing.quantity + quantity;
      this.portfolio.holdings[symbol] = {
        symbol,
        quantity: newQty,
        average_buy_price: newTotalCost / newQty,
        total_cost_basis: newTotalCost,
      };

      const tx: Transaction = {
        id: txId,
        timestamp: now,
        symbol,
        side,
        order_type: type,
        quantity,
        price: execPrice,
        fee,
        total: totalCost,
        realized_pnl: null,
      };
      this.portfolio.recent_transactions.unshift(tx);
      this.updatePortfolioNetWorth();
      return tx;
    } else {
      const holding = this.portfolio.holdings[symbol];
      if (!holding || holding.quantity < quantity) {
        throw new Error(`Insufficient quantity. Owned: ${holding?.quantity?.toFixed(4) ?? 0}`);
      }

      const costBasis = holding.average_buy_price * quantity;
      const netProceeds = gross - fee;
      const pnl = netProceeds - costBasis;

      holding.quantity -= quantity;
      holding.total_cost_basis -= costBasis;
      if (holding.quantity <= 0.0001) {
        delete this.portfolio.holdings[symbol];
      }

      this.portfolio.cash += netProceeds;
      this.portfolio.realized_pnl += pnl;

      const tx: Transaction = {
        id: txId,
        timestamp: now,
        symbol,
        side,
        order_type: type,
        quantity,
        price: execPrice,
        fee,
        total: netProceeds,
        realized_pnl: pnl,
      };
      this.portfolio.recent_transactions.unshift(tx);
      this.updatePortfolioNetWorth();
      return tx;
    }
  }

  updatePortfolioNetWorth() {
    let holdingsValue = 0;
    let unrealized = 0;

    for (const [sym, holding] of Object.entries(this.portfolio.holdings)) {
      const asset = this.assets.find((a) => a.symbol === sym);
      if (asset) {
        const val = holding.quantity * asset.current_price;
        holdingsValue += val;
        unrealized += val - holding.total_cost_basis;
      }
    }

    this.portfolio.unrealized_pnl = unrealized;
    this.portfolio.net_worth = (this.portfolio.cash + holdingsValue) - this.portfolio.bank.loan_balance;
    this.portfolio.rank = computeRank(this.portfolio.net_worth);
  }

  borrow(amount: number) {
    if (amount <= 0) throw new Error('Invalid amount');
    const available = this.portfolio.bank.max_borrow_limit - this.portfolio.bank.loan_balance;
    if (amount > available) throw new Error(`Exceeds limit: max $${available.toFixed(2)}`);
    this.portfolio.bank.loan_balance += amount;
    this.portfolio.cash += amount;
    this.updatePortfolioNetWorth();
  }

  repay(amount: number) {
    if (amount <= 0) throw new Error('Invalid amount');
    if (amount > this.portfolio.cash) throw new Error(`Insufficient cash: $${this.portfolio.cash.toFixed(2)}`);
    const actual = Math.min(amount, this.portfolio.bank.loan_balance);
    this.portfolio.cash -= actual;
    this.portfolio.bank.loan_balance -= actual;
    this.updatePortfolioNetWorth();
  }

  saveGame(): void {
    if (typeof localStorage === 'undefined') return;
    const saveObj = {
      assets: this.assets,
      config: this.config,
      portfolio: this.portfolio,
      news: this.newsHistory,
      elapsed: this.elapsedSeconds,
    };
    localStorage.setItem('simange_savegame', JSON.stringify(saveObj));
  }

  loadGame(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem('simange_savegame');
    if (!raw) return false;
    try {
      const obj = JSON.parse(raw);
      this.assets = obj.assets;
      this.config = obj.config;
      this.portfolio = obj.portfolio;
      this.newsHistory = obj.news;
      this.elapsedSeconds = obj.elapsed;
      return true;
    } catch {
      return false;
    }
  }

  hasSave(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return Boolean(localStorage.getItem('simange_savegame'));
  }
}
