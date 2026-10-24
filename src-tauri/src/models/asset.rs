use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AssetCategory {
    Crypto,
    Stock,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Candle {
    pub timestamp: i64,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub id: String,
    pub symbol: String,
    pub name: String,
    pub category: AssetCategory,
    pub current_price: f64,
    pub previous_close: f64,
    pub high_24h: f64,
    pub low_24h: f64,
    pub volume_24h: f64,
    pub change_24h_pct: f64,
    pub base_volatility: f64,
    pub trend_bias: f64, // Positive = bullish drift, negative = bearish drift
    pub dividend_yield: f64, // For stocks (annualized rate paid periodically)
    pub description: String,
    pub candles: Vec<Candle>,
}

impl Asset {
    pub fn new(
        id: &str,
        symbol: &str,
        name: &str,
        category: AssetCategory,
        initial_price: f64,
        base_volatility: f64,
        dividend_yield: f64,
        description: &str,
    ) -> Self {
        let initial_candle = Candle {
            timestamp: chrono::Utc::now().timestamp(),
            open: initial_price,
            high: initial_price,
            low: initial_price,
            close: initial_price,
            volume: 1000.0,
        };

        Self {
            id: id.to_string(),
            symbol: symbol.to_string(),
            name: name.to_string(),
            category,
            current_price: initial_price,
            previous_close: initial_price,
            high_24h: initial_price,
            low_24h: initial_price,
            volume_24h: 1000.0,
            change_24h_pct: 0.0,
            base_volatility,
            trend_bias: 0.0,
            dividend_yield,
            description: description.to_string(),
            candles: vec![initial_candle],
        }
    }

    pub fn update_price(&mut self, new_price: f64, volume_delta: f64) {
        let rounded_price = (new_price * 10000.0).round() / 10000.0;
        self.current_price = rounded_price.max(0.0001);

        if self.current_price > self.high_24h {
            self.high_24h = self.current_price;
        }
        if self.current_price < self.low_24h || self.low_24h == 0.0 {
            self.low_24h = self.current_price;
        }

        self.volume_24h += volume_delta;
        if self.previous_close > 0.0 {
            self.change_24h_pct = ((self.current_price - self.previous_close) / self.previous_close) * 100.0;
        }

        let now = chrono::Utc::now().timestamp();
        if let Some(last_candle) = self.candles.last_mut() {
            // Candle timeframe: 10 seconds per candle
            if now - last_candle.timestamp < 10 {
                last_candle.close = self.current_price;
                last_candle.high = last_candle.high.max(self.current_price);
                last_candle.low = last_candle.low.min(self.current_price);
                last_candle.volume += volume_delta;
            } else {
                let new_candle = Candle {
                    timestamp: now,
                    open: last_candle.close,
                    high: self.current_price.max(last_candle.close),
                    low: self.current_price.min(last_candle.close),
                    close: self.current_price,
                    volume: volume_delta.max(10.0),
                };
                self.candles.push(new_candle);
                // Keep max 100 candles in memory for responsive chart streaming
                if self.candles.len() > 100 {
                    self.candles.remove(0);
                }
            }
        }
    }
}
