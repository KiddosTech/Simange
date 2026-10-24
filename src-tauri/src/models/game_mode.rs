use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum GameModeType {
    StockExchange,
    Cryptocurrency,
    Test,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameModeConfig {
    pub mode_type: GameModeType,
    pub starting_cash: f64,
    pub volatility_multiplier: f64,
    pub news_frequency_secs: u64,
    pub enable_dividends: bool,
    pub active_asset_ids: Vec<String>,
    pub time_speed_multiplier: f64,
    pub infinite_cash: bool,
}

impl Default for GameModeConfig {
    fn default() -> Self {
        Self::stock_mode()
    }
}

impl GameModeConfig {
    pub fn stock_mode() -> Self {
        Self {
            mode_type: GameModeType::StockExchange,
            starting_cash: 25_000.0,
            volatility_multiplier: 0.8,
            news_frequency_secs: 45,
            enable_dividends: true,
            active_asset_ids: vec![
                "pear".to_string(),
                "mhd".to_string(),
                "tslax".to_string(),
                "pixl".to_string(),
                "goog".to_string(),
                "mate".to_string(),
                "xomm".to_string(),
                "msm".to_string(),
                "bae".to_string(),
                "ccn".to_string(),
                "ambk".to_string(),
                "bcly".to_string(),
            ],
            time_speed_multiplier: 1.0,
            infinite_cash: false,
        }
    }

    pub fn crypto_mode() -> Self {
        Self {
            mode_type: GameModeType::Cryptocurrency,
            starting_cash: 10_000.0,
            volatility_multiplier: 3.2,
            news_frequency_secs: 15,
            enable_dividends: false,
            active_asset_ids: vec![
                "byte".to_string(),
                "aeth".to_string(),
                "sola".to_string(),
                "meow".to_string(),
                "usdf".to_string(),
            ],
            time_speed_multiplier: 1.0,
            infinite_cash: false,
        }
    }

    pub fn test_mode() -> Self {
        Self {
            mode_type: GameModeType::Test,
            starting_cash: 100_000_000.0,
            volatility_multiplier: 1.5,
            news_frequency_secs: 20,
            enable_dividends: true,
            active_asset_ids: vec![
                "pear".to_string(),
                "mhd".to_string(),
                "tslax".to_string(),
                "pixl".to_string(),
                "goog".to_string(),
                "mate".to_string(),
                "xomm".to_string(),
                "msm".to_string(),
                "bae".to_string(),
                "ccn".to_string(),
                "ambk".to_string(),
                "bcly".to_string(),
                "byte".to_string(),
                "aeth".to_string(),
                "sola".to_string(),
                "meow".to_string(),
                "usdf".to_string(),
            ],
            time_speed_multiplier: 1.0,
            infinite_cash: true,
        }
    }

    pub fn custom_mode(
        starting_cash: f64,
        volatility_multiplier: f64,
        news_frequency_secs: u64,
        enable_dividends: bool,
        active_asset_ids: Vec<String>,
        time_speed_multiplier: f64,
    ) -> Self {
        Self {
            mode_type: GameModeType::Custom,
            starting_cash,
            volatility_multiplier,
            news_frequency_secs,
            enable_dividends,
            active_asset_ids,
            time_speed_multiplier,
            infinite_cash: false,
        }
    }
}
