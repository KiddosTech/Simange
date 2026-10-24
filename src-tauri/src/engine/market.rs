use rand::Rng;
use crate::models::{Asset, AssetCategory, OrderBook, GameModeConfig};

pub struct MarketEngine {
    pub assets: Vec<Asset>,
}

impl MarketEngine {
    pub fn new() -> Self {
        let assets = vec![
            // Cryptocurrency Mode Parodies
            Asset::new(
                "byte",
                "BYTE",
                "Bytecoin",
                AssetCategory::Crypto,
                68450.0,
                0.025,
                0.0,
                "The pioneer decentralized digital token. Gold standard of blockchain parody.",
            ),
            Asset::new(
                "aeth",
                "AETH",
                "Aethereum",
                AssetCategory::Crypto,
                3620.0,
                0.035,
                0.0,
                "Smart contract platform powering endless DeFi experiments and gas spikes.",
            ),
            Asset::new(
                "sola",
                "SOLA",
                "Solona",
                AssetCategory::Crypto,
                185.50,
                0.050,
                0.0,
                "Ultra-fast Layer 1 with incredible throughput whenever the network stays online.",
            ),
            Asset::new(
                "meow",
                "MEOW",
                "MeowCoin",
                AssetCategory::Crypto,
                0.1540,
                0.095,
                0.0,
                "Feline-themed community meme coin. Heavily manipulated by social media influencers.",
            ),
            Asset::new(
                "usdf",
                "USDF",
                "USD-Fake",
                AssetCategory::Crypto,
                1.0000,
                0.003,
                0.0,
                "Algorithmic stablecoin backed by trust and hope. Mild depeg events occur.",
            ),
            // Stock Exchange Mode Parodies
            Asset::new(
                "pear",
                "PEAR",
                "Pear Inc.",
                AssetCategory::Stock,
                224.50,
                0.012,
                0.016,
                "Consumer tech juggernaut selling titanium phones and designer goggles.",
            ),
            Asset::new(
                "mhd",
                "MHD",
                "MicroHard",
                AssetCategory::Stock,
                448.20,
                0.011,
                0.014,
                "Enterprise software titan. Dominates cloud computing, spreadsheets, and OS updates.",
            ),
            Asset::new(
                "tslax",
                "TSLA-X",
                "MuskCar",
                AssetCategory::Stock,
                262.30,
                0.035,
                0.0,
                "Autonomous electric vehicles and humanoid robot memes led by an eccentric CEO.",
            ),
            Asset::new(
                "pixl",
                "PIXL",
                "Nvidiot",
                AssetCategory::Stock,
                132.80,
                0.032,
                0.005,
                "Semiconductor behemoth producing GPU silicon that fuels the global AI bubble.",
            ),
            Asset::new(
                "goog",
                "GOOG",
                "Googol",
                AssetCategory::Stock,
                178.40,
                0.015,
                0.008,
                "Omnipresent search and cloud AI conglomerate indexing global cyberspace.",
            ),
            Asset::new(
                "mate",
                "MATE",
                "Mate",
                AssetCategory::Stock,
                560.20,
                0.022,
                0.005,
                "Social metaverse nexus connecting billions through algorithms and VR headsets.",
            ),
            Asset::new(
                "xomm",
                "XOMM",
                "XennonMobile",
                AssetCategory::Stock,
                118.60,
                0.012,
                0.034,
                "Global fossil fuel and LNG titan powering traditional international industry.",
            ),
            Asset::new(
                "msm",
                "MS-M",
                "Sergei Manly",
                AssetCategory::Stock,
                104.50,
                0.016,
                0.032,
                "High-flying Wall Street investment bank, wealth manager, and underwriting powerhouse.",
            ),
            Asset::new(
                "bae",
                "BA-E",
                "Baeing",
                AssetCategory::Stock,
                154.30,
                0.028,
                0.000,
                "Commercial jetliner and defense contractor facing relentless fuselage scrutiny.",
            ),
            Asset::new(
                "ccn",
                "CCN",
                "CCN",
                AssetCategory::Stock,
                42.80,
                0.020,
                0.025,
                "24-hour global cable news syndicate and sensationalist media broadcast channel.",
            ),
            Asset::new(
                "ambk",
                "AMBK",
                "American Bank",
                AssetCategory::Stock,
                38.50,
                0.014,
                0.028,
                "Commercial banking giant managing millions of retail accounts and mortgage debt.",
            ),
            Asset::new(
                "bcly",
                "BCLY",
                "Boreclay",
                AssetCategory::Stock,
                28.20,
                0.017,
                0.035,
                "Historic transatlantic corporate bank with premier credit card settlement networks.",
            ),
        ];

        Self { assets }
    }

    pub fn tick(&mut self, config: &GameModeConfig) {
        let mut rng = rand::thread_rng();

        for asset in &mut self.assets {
            // Check if active in current mode
            if !config.active_asset_ids.contains(&asset.id) {
                continue;
            }

            // Geometric random walk simulation
            let normal_shock: f64 = rng.gen_range(-1.0..1.0);
            let volatility = asset.base_volatility * config.volatility_multiplier;
            
            // Random Poisson-like jump diffusion (rare extreme spikes/crashes)
            let jump_prob: f64 = rng.gen_range(0.0..1.0);
            let jump_shock = if jump_prob > 0.98 {
                let spike = rng.gen_range(-0.06..0.08);
                spike * config.volatility_multiplier
            } else {
                0.0
            };

            // Drift with trend bias
            let delta_pct = (normal_shock * volatility * 0.5) + (asset.trend_bias * 0.2) + jump_shock;
            
            // Slowly decay trend bias towards 0
            asset.trend_bias *= 0.92;

            let new_price = (asset.current_price * (1.0 + delta_pct)).max(0.0001);
            let volume_delta = (asset.current_price * rng.gen_range(5.0..25.0)).abs();

            asset.update_price(new_price, volume_delta);
        }
    }

    pub fn apply_news_shock(&mut self, symbol: &str, shock_pct: f64) {
        if let Some(asset) = self.assets.iter_mut().find(|a| a.symbol == symbol) {
            asset.trend_bias += shock_pct * 0.7;
            let immediate_price = asset.current_price * (1.0 + shock_pct);
            let vol = (immediate_price * 100.0).abs();
            asset.update_price(immediate_price, vol);
        }
    }

    pub fn get_order_book(&self, symbol: &str) -> Option<OrderBook> {
        let asset = self.assets.iter().find(|a| a.symbol == symbol)?;
        let spread_pct = match asset.category {
            AssetCategory::Crypto => 0.15,
            AssetCategory::Stock => 0.05,
        };
        Some(OrderBook::generate_synthetic(symbol, asset.current_price, spread_pct))
    }
}
