export type AssetCategory = 'Crypto' | 'Stock';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  current_price: number;
  previous_close: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  change_24h_pct: number;
  base_volatility: number;
  trend_bias: number;
  dividend_yield: number;
  description: string;
  candles: Candle[];
}

export type OrderSide = 'Buy' | 'Sell';
export type OrderType = 'Market' | 'Limit';

export interface OrderLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBook {
  asset_symbol: string;
  bids: OrderLevel[];
  asks: OrderLevel[];
  spread: number;
  spread_pct: number;
}

export interface Holding {
  symbol: string;
  quantity: number;
  average_buy_price: number;
  total_cost_basis: number;
}

export interface Transaction {
  id: string;
  timestamp: number;
  symbol: string;
  side: OrderSide;
  order_type: OrderType;
  quantity: number;
  price: number;
  fee: number;
  total: number;
  realized_pnl?: number | null;
}

export interface BankAccount {
  loan_balance: number;
  max_borrow_limit: number;
  interest_rate_apr: number;
  accumulated_dividends: number;
}

export type RankId =
  | 'RetailNoob'
  | 'DayTraderKids'
  | 'WallStreetWannabe'
  | 'MarketChad'
  | 'CryptoWhale'
  | 'WallStreetLegend';

export interface RankInfo {
  id: RankId;
  title: string;
  min_threshold: number;
  max_threshold: number | null;
  badge_color: string;
  perk_description: string;
  progress_pct: number;
  next_tier_needed: number;
}

export type NewsImpact = 'Bullish' | 'Bearish' | 'Neutral';

export interface NewsItem {
  id: string;
  timestamp: number;
  headline: string;
  body: string;
  source: string;
  affected_symbol?: string | null;
  impact: NewsImpact;
  shock_magnitude: number;
  is_read: boolean;
  ceo_image?: string | null;
  ceo_name?: string | null;
}

export type GameModeType = 'StockExchange' | 'Cryptocurrency' | 'Test' | 'Custom';

export interface GameModeConfig {
  mode_type: GameModeType;
  starting_cash: number;
  volatility_multiplier: number;
  news_frequency_secs: number;
  enable_dividends: boolean;
  active_asset_ids: string[];
  time_speed_multiplier: number;
  infinite_cash: boolean;
}

export interface PortfolioSummary {
  cash: number;
  net_worth: number;
  unrealized_pnl: number;
  realized_pnl: number;
  holdings: Record<string, Holding>;
  recent_transactions: Transaction[];
  rank: RankInfo;
  bank: BankAccount;
}

export interface GameStatus {
  is_paused: boolean;
  time_speed: number;
  elapsed_seconds: number;
  mode: GameModeType;
}
