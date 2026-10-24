use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OrderSide {
    Buy,
    Sell,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OrderType {
    Market,
    Limit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderLevel {
    pub price: f64,
    pub quantity: f64,
    pub total: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderBook {
    pub asset_symbol: String,
    pub bids: Vec<OrderLevel>, // Highest bid first
    pub asks: Vec<OrderLevel>, // Lowest ask first
    pub spread: f64,
    pub spread_pct: f64,
}

impl OrderBook {
    pub fn generate_synthetic(asset_symbol: &str, current_price: f64, spread_pct: f64) -> Self {
        let half_spread = current_price * (spread_pct / 200.0);
        let best_bid = current_price - half_spread;
        let best_ask = current_price + half_spread;

        let mut bids = Vec::with_capacity(10);
        let mut asks = Vec::with_capacity(10);

        let mut cum_bid_total = 0.0;
        for i in 0..8 {
            let step = (i as f64 + 1.0) * 0.0015 * current_price;
            let level_price = (best_bid - step).max(0.0001);
            let qty = (50.0 / (level_price / 100.0).max(1.0)) * (1.0 + (i as f64 * 0.4));
            let total = level_price * qty;
            cum_bid_total += total;
            bids.push(OrderLevel {
                price: (level_price * 10000.0).round() / 10000.0,
                quantity: (qty * 1000.0).round() / 1000.0,
                total: (cum_bid_total * 100.0).round() / 100.0,
            });
        }

        let mut cum_ask_total = 0.0;
        for i in 0..8 {
            let step = (i as f64 + 1.0) * 0.0015 * current_price;
            let level_price = best_ask + step;
            let qty = (50.0 / (level_price / 100.0).max(1.0)) * (1.0 + (i as f64 * 0.4));
            let total = level_price * qty;
            cum_ask_total += total;
            asks.push(OrderLevel {
                price: (level_price * 10000.0).round() / 10000.0,
                quantity: (qty * 1000.0).round() / 1000.0,
                total: (cum_ask_total * 100.0).round() / 100.0,
            });
        }

        let spread = best_ask - best_bid;
        let spread_percentage = if current_price > 0.0 {
            (spread / current_price) * 100.0
        } else {
            0.0
        };

        Self {
            asset_symbol: asset_symbol.to_string(),
            bids,
            asks,
            spread: (spread * 10000.0).round() / 10000.0,
            spread_pct: (spread_percentage * 100.0).round() / 100.0,
        }
    }
}
