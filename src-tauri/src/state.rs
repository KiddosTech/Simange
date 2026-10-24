use std::sync::Arc;
use tokio::sync::RwLock;
use crate::models::*;
use crate::engine::*;

pub struct GameEngine {
    pub market: MarketEngine,
    pub portfolio: Portfolio,
    pub news: NewsEngine,
    pub config: GameModeConfig,
    pub is_paused: bool,
    pub time_speed: f64,
    pub elapsed_seconds: u64,
}

impl GameEngine {
    pub fn new(config: GameModeConfig) -> Self {
        let starting_cash = config.starting_cash;
        Self {
            market: MarketEngine::new(),
            portfolio: Portfolio::new(starting_cash),
            news: NewsEngine::new(),
            config,
            is_paused: false,
            time_speed: 1.0,
            elapsed_seconds: 0,
        }
    }

    pub fn tick(&mut self) -> Option<NewsItem> {
        if self.is_paused {
            return None;
        }

        // Advance simulation
        self.market.tick(&self.config);

        // Process interest & dividends
        let delta_secs = 1.0 * self.time_speed;
        BankEngine::process_interest(&mut self.portfolio, delta_secs);
        if self.config.enable_dividends {
            BankEngine::process_dividends(&mut self.portfolio, &self.market.assets, delta_secs);
        }

        self.elapsed_seconds += (1.0 * self.time_speed) as u64;
        let now = chrono::Utc::now().timestamp();

        // Check news trigger
        if let Some(news_item) = self.news.maybe_generate_news(now, self.config.mode_type, self.config.news_frequency_secs) {
            if let Some(ref sym) = news_item.affected_symbol {
                self.market.apply_news_shock(sym, news_item.shock_magnitude);
            }
            Some(news_item)
        } else {
            None
        }
    }

    pub fn execute_trade(
        &mut self,
        symbol: &str,
        side: OrderSide,
        order_type: OrderType,
        quantity: f64,
        limit_price: Option<f64>,
    ) -> Result<Transaction, String> {
        let asset = self
            .market
            .assets
            .iter()
            .find(|a| a.symbol == symbol)
            .ok_or_else(|| format!("Asset '{}' not found", symbol))?
            .clone();

        let exec_price = match order_type {
            OrderType::Market => {
                // Slippage model: 0.1% base slippage
                let slippage = match side {
                    OrderSide::Buy => 1.001,
                    OrderSide::Sell => 0.999,
                };
                asset.current_price * slippage
            }
            OrderType::Limit => {
                let l_price = limit_price.ok_or("Limit price required for Limit order")?;
                match side {
                    OrderSide::Buy => {
                        if l_price < asset.current_price {
                            return Err(format!("Limit buy price ${:.2} is below current ask ${:.2}", l_price, asset.current_price));
                        }
                    }
                    OrderSide::Sell => {
                        if l_price > asset.current_price {
                            return Err(format!("Limit sell price ${:.2} is above current bid ${:.2}", l_price, asset.current_price));
                        }
                    }
                }
                l_price
            }
        };

        let gross_total = exec_price * quantity;
        
        // Fee calculation: Retail Noob is 0.25%, higher tiers get discount
        let net_worth = self.portfolio.calculate_net_worth(&self.market.assets);
        let rank = RankSystem::get_rank(net_worth);
        let fee_rate = match rank.id {
            RankId::RetailNoob => 0.0025,
            RankId::DayTraderKids => 0.0020,
            RankId::WallStreetWannabe => 0.0015,
            RankId::MarketChad => 0.0008,
            RankId::CryptoWhale => 0.0004,
            RankId::WallStreetLegend => 0.0,
        };
        let fee = gross_total * fee_rate;

        let now = chrono::Utc::now().timestamp();
        let tx_id = format!("tx-{}", now);

        match side {
            OrderSide::Buy => {
                let total_cost = gross_total + fee;
                if !self.config.infinite_cash && self.portfolio.cash < total_cost {
                    return Err(format!("Insufficient cash balance. Required: ${:.2}, Available: ${:.2}", total_cost, self.portfolio.cash));
                }

                if !self.config.infinite_cash {
                    self.portfolio.cash -= total_cost;
                }

                let entry = self.portfolio.holdings.entry(symbol.to_string()).or_insert(Holding {
                    symbol: symbol.to_string(),
                    quantity: 0.0,
                    average_buy_price: 0.0,
                    total_cost_basis: 0.0,
                });

                let new_total_cost = entry.total_cost_basis + gross_total;
                let new_qty = entry.quantity + quantity;
                entry.average_buy_price = if new_qty > 0.0 { new_total_cost / new_qty } else { 0.0 };
                entry.quantity = new_qty;
                entry.total_cost_basis = new_total_cost;

                let tx = Transaction {
                    id: tx_id,
                    timestamp: now,
                    symbol: symbol.to_string(),
                    side,
                    order_type,
                    quantity,
                    price: exec_price,
                    fee,
                    total: total_cost,
                    realized_pnl: None,
                };
                self.portfolio.transactions.insert(0, tx.clone());
                Ok(tx)
            }
            OrderSide::Sell => {
                let holding = self.portfolio.holdings.get_mut(symbol).ok_or("No position held in this asset")?;
                if holding.quantity < quantity {
                    return Err(format!("Insufficient quantity. Owned: {:.4}, Requested to sell: {:.4}", holding.quantity, quantity));
                }

                let cost_portion = holding.average_buy_price * quantity;
                let net_proceeds = gross_total - fee;
                let pnl = net_proceeds - cost_portion;

                holding.quantity -= quantity;
                holding.total_cost_basis -= cost_portion;
                if holding.quantity <= 0.00001 {
                    self.portfolio.holdings.remove(symbol);
                }

                self.portfolio.cash += net_proceeds;
                self.portfolio.total_realized_pnl += pnl;

                let tx = Transaction {
                    id: tx_id,
                    timestamp: now,
                    symbol: symbol.to_string(),
                    side,
                    order_type,
                    quantity,
                    price: exec_price,
                    fee,
                    total: net_proceeds,
                    realized_pnl: Some(pnl),
                };
                self.portfolio.transactions.insert(0, tx.clone());
                Ok(tx)
            }
        }
    }

    pub fn to_save_data(&self) -> SaveData {
        SaveData {
            version: "0.1.0".to_string(),
            timestamp: chrono::Utc::now().timestamp(),
            portfolio: self.portfolio.clone(),
            config: self.config.clone(),
            assets: self.market.assets.clone(),
            news: self.news.history.clone(),
            elapsed_game_seconds: self.elapsed_seconds,
        }
    }

    pub fn restore_save_data(&mut self, data: SaveData) {
        self.portfolio = data.portfolio;
        self.config = data.config;
        self.market.assets = data.assets;
        self.news.history = data.news;
        self.elapsed_seconds = data.elapsed_game_seconds;
    }
}

pub type SafeAppState = Arc<RwLock<GameEngine>>;
