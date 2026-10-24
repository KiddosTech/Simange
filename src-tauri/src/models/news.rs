use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum NewsImpact {
    Bullish,
    Bearish,
    Neutral,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewsItem {
    pub id: String,
    pub timestamp: i64,
    pub headline: String,
    pub body: String,
    pub source: String,
    pub affected_symbol: Option<String>,
    pub impact: NewsImpact,
    pub shock_magnitude: f64, // e.g. 0.08 = +8% drift/jump
    pub is_read: bool,
    pub ceo_image: Option<String>,
    pub ceo_name: Option<String>,
}
