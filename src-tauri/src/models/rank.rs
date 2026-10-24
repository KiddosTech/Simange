use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RankId {
    RetailNoob,
    DayTraderKids,
    WallStreetWannabe,
    MarketChad,
    CryptoWhale,
    WallStreetLegend,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RankInfo {
    pub id: RankId,
    pub title: String,
    pub min_threshold: f64,
    pub max_threshold: Option<f64>,
    pub badge_color: String,
    pub perk_description: String,
    pub progress_pct: f64,
    pub next_tier_needed: f64,
}

pub struct RankSystem;

impl RankSystem {
    pub fn get_rank(net_worth: f64) -> RankInfo {
        if net_worth < 15_000.0 {
            let progress = (net_worth.max(0.0) / 15_000.0) * 100.0;
            RankInfo {
                id: RankId::RetailNoob,
                title: "Retail Noob".to_string(),
                min_threshold: 0.0,
                max_threshold: Some(15_000.0),
                badge_color: "#6b7280", // Gray
                perk_description: "Base trading fee: 0.25%. Limited bank loan limit.".to_string(),
                progress_pct: progress.clamp(0.0, 100.0),
                next_tier_needed: (15_000.0 - net_worth).max(0.0),
            }
        } else if net_worth < 50_000.0 {
            let progress = ((net_worth - 15_000.0) / (50_000.0 - 15_000.0)) * 100.0;
            RankInfo {
                id: RankId::DayTraderKids,
                title: "Day Trader Kids".to_string(),
                min_threshold: 15_000.0,
                max_threshold: Some(50_000.0),
                badge_color: "#3b82f6", // Blue
                perk_description: "Unlocked 2x Margin trading and 0.20% fee rebate.".to_string(),
                progress_pct: progress.clamp(0.0, 100.0),
                next_tier_needed: (50_000.0 - net_worth).max(0.0),
            }
        } else if net_worth < 250_000.0 {
            let progress = ((net_worth - 50_000.0) / (250_000.0 - 50_000.0)) * 100.0;
            RankInfo {
                id: RankId::WallStreetWannabe,
                title: "Wall Street Wannabe".to_string(),
                min_threshold: 50_000.0,
                max_threshold: Some(250_000.0),
                badge_color: "#10b981", // Emerald Green
                perk_description: "Bank loans up to $100,000. Insider rumors access.".to_string(),
                progress_pct: progress.clamp(0.0, 100.0),
                next_tier_needed: (250_000.0 - net_worth).max(0.0),
            }
        } else if net_worth < 1_000_000.0 {
            let progress = ((net_worth - 250_000.0) / (1_000_000.0 - 250_000.0)) * 100.0;
            RankInfo {
                id: RankId::MarketChad,
                title: "Market Chad".to_string(),
                min_threshold: 250_000.0,
                max_threshold: Some(1_000_000.0),
                badge_color: "#f59e0b", // Amber
                perk_description: "VIP Dark Pool execution. 0.08% maker fee.".to_string(),
                progress_pct: progress.clamp(0.0, 100.0),
                next_tier_needed: (1_000_000.0 - net_worth).max(0.0),
            }
        } else if net_worth < 10_000_000.0 {
            let progress = ((net_worth - 1_000_000.0) / (10_000_000.0 - 1_000_000.0)) * 100.0;
            RankInfo {
                id: RankId::CryptoWhale,
                title: "Crypto Whale".to_string(),
                min_threshold: 1_000_000.0,
                max_threshold: Some(10_000_000.0),
                badge_color: "#a855f7", // Purple Neon
                perk_description: "Market moving volume capacity. Priority pump alerts.".to_string(),
                progress_pct: progress.clamp(0.0, 100.0),
                next_tier_needed: (10_000_000.0 - net_worth).max(0.0),
            }
        } else {
            RankInfo {
                id: RankId::WallStreetLegend,
                title: "Wall Street Legend".to_string(),
                min_threshold: 10_000_000.0,
                max_threshold: None,
                badge_color: "#00f796", // Cyberpunk High-Roller Mint
                perk_description: "Master of Markets. Infinite borrowing lines and zero fees.".to_string(),
                progress_pct: 100.0,
                next_tier_needed: 0.0,
            }
        }
    }

    pub fn get_all_ranks() -> Vec<RankInfo> {
        vec![
            Self::get_rank(5_000.0),
            Self::get_rank(25_000.0),
            Self::get_rank(100_000.0),
            Self::get_rank(500_000.0),
            Self::get_rank(3_000_000.0),
            Self::get_rank(15_000_000.0),
        ]
    }
}
