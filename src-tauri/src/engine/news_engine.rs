use rand::seq::SliceRandom;
use rand::Rng;
use crate::models::{NewsImpact, NewsItem, GameModeType};

pub struct NewsEngine {
    pub history: Vec<NewsItem>,
    pub last_news_time: i64,
}

impl NewsEngine {
    pub fn new() -> Self {
        Self {
            history: Vec::new(),
            last_news_time: 0,
        }
    }

    pub fn maybe_generate_news(&mut self, current_time: i64, mode: GameModeType, interval_secs: u64) -> Option<NewsItem> {
        if current_time - self.last_news_time < interval_secs as i64 {
            return None;
        }

        let mut rng = rand::thread_rng();
        let roll: f64 = rng.gen_range(0.0..1.0);
        if roll < 0.35 {
            return None;
        }

        let item = match mode {
            GameModeType::Cryptocurrency => Self::generate_crypto_news(&mut rng, current_time),
            GameModeType::StockExchange => Self::generate_stock_news(&mut rng, current_time),
            _ => {
                let ceo_roll: f64 = rng.gen_range(0.0..1.0);
                if ceo_roll < 0.35 {
                    Self::generate_ceo_news(&mut rng, current_time)
                } else if rng.gen_bool(0.5) {
                    Self::generate_crypto_news(&mut rng, current_time)
                } else {
                    Self::generate_stock_news(&mut rng, current_time)
                }
            }
        };

        self.last_news_time = current_time;
        self.history.insert(0, item.clone());
        if self.history.len() > 50 {
            self.history.truncate(50);
        }

        Some(item)
    }

    fn generate_ceo_news<R: Rng>(rng: &mut R, timestamp: i64) -> NewsItem {
        let ceos = [
            (
                "Willy Bate",
                "MHD",
                "/ceo/willy_bate.jpg",
                "Willy Bate announces revolutionary MicroHard autonomous enterprise intelligence grid",
                "Speaking before institutional partners, Willy Bate revealed that over 90% of Fortune 500 workflows now run on MicroHard enterprise subscriptions.",
                "CCN Live",
                NewsImpact::Bullish,
                0.075,
            ),
            (
                "Elon Mowsk",
                "TSLA-X",
                "/ceo/elon_mowsk.jpg",
                "Elon Mowsk confirms autonomous cyber-taxi commercial deployments ahead of schedule",
                "Regulatory clearances granted in major metropolitan corridors as pre-orders surpass 1.2 Million vehicles.",
                "Silicon Beat",
                NewsImpact::Bullish,
                0.095,
            ),
            (
                "Elon Mowsk",
                "MEOW",
                "/ceo/elon_mowsk.jpg",
                "Elon Mowsk posts midnight tweet featuring MeowCoin cyber astronaut",
                "Trading algorithms ignited an instant liquidity surge as 50x leverage perpetual longs flooded order books within seconds.",
                "ChirpStream Breaking",
                NewsImpact::Bullish,
                0.16,
            ),
            (
                "James Huang",
                "PIXL",
                "/ceo/james_huang.jpg",
                "James Huang unveils trillion-transistor Blackwell-Ultra GPU cluster in black leather jacket",
                "Hyperscale datacenter operators scramble to secure allocations, extending order backlogs through fiscal year.",
                "DeepTech Digest",
                NewsImpact::Bullish,
                0.088,
            ),
            (
                "John Ternas",
                "PEAR",
                "/ceo/john_ternas.jpg",
                "John Ternas showcases titanium holographic PearBook to standing ovation",
                "Supply chain yields achieve record efficiency ahead of peak holiday shopping season.",
                "FinTimes Global",
                NewsImpact::Bullish,
                0.065,
            ),
        ];

        let (ceo_name, sym, image, headline, body, source, impact, shock) = ceos.choose(rng).unwrap();
        let shock_variance = rng.gen_range(-0.01..0.02);

        NewsItem {
            id: format!("news-ceo-{}", timestamp),
            timestamp,
            headline: headline.to_string(),
            body: body.to_string(),
            source: source.to_string(),
            affected_symbol: Some(sym.to_string()),
            impact: *impact,
            shock_magnitude: shock + shock_variance,
            is_read: false,
            ceo_image: Some(image.to_string()),
            ceo_name: Some(ceo_name.to_string()),
        }
    }

    fn generate_crypto_news<R: Rng>(rng: &mut R, timestamp: i64) -> NewsItem {
        let templates = [
            (
                "MEOW",
                "Elon Mowsk tweets picture of a dog sleeping on a keyboard",
                "Social media frenzy pushes MeowCoin trading volume up 800% in 15 minutes as retail chads ape in.",
                "ChirpStream Daily",
                NewsImpact::Bullish,
                0.14,
                Some("/ceo/elon_mowsk.jpg"),
                Some("Elon Mowsk"),
            ),
            (
                "BYTE",
                "Global Reserve Bank signals openness to Bytecoin strategic holdings",
                "Central bankers quietly accumulate BYTE amid rising fiat debasement concerns.",
                "CryptoWhale Gazette",
                NewsImpact::Bullish,
                0.08,
                None,
                None,
            ),
            (
                "BYTE",
                "Mysterious dormant wallet from 2011 moves 50,000 BYTE to offshore exchange",
                "Panicked liquidations cascade across perpetual swaps as traders brace for market dumping.",
                "Terminal Wire",
                NewsImpact::Bearish,
                -0.09,
                None,
                None,
            ),
            (
                "AETH",
                "Aethereum foundation successfully ships Layer 2 compression upgrade",
                "Average gas fees plummet to under 3 cents, triggering unprecedented smart contract activity.",
                "Etherscope",
                NewsImpact::Bullish,
                0.065,
                None,
                None,
            ),
            (
                "SOLA",
                "Solona network halts block production for 42 minutes due to NFT mint congestion",
                "Validators coordinate emergency restart on Discord while bears open aggressive short positions.",
                "DeFi Defector",
                NewsImpact::Bearish,
                -0.075,
                None,
                None,
            ),
            (
                "USDF",
                "USD-Fake experiences brief depeg to $0.94 following reserve transparency audit",
                "Issuer promises full collateralization with commercial paper and digital real estate.",
                "StableAlert",
                NewsImpact::Bearish,
                -0.05,
                None,
                None,
            ),
        ];

        let (sym, headline, body, source, impact, shock, img, name) = templates.choose(rng).unwrap();
        let shock_variance = rng.gen_range(-0.02..0.02);

        NewsItem {
            id: format!("news-{}", timestamp),
            timestamp,
            headline: headline.to_string(),
            body: body.to_string(),
            source: source.to_string(),
            affected_symbol: Some(sym.to_string()),
            impact: *impact,
            shock_magnitude: shock + shock_variance,
            is_read: false,
            ceo_image: img.map(|s| s.to_string()),
            ceo_name: name.map(|s| s.to_string()),
        }
    }

    fn generate_stock_news<R: Rng>(rng: &mut R, timestamp: i64) -> NewsItem {
        let templates = [
            (
                "GOOG",
                "Googol launches autonomous Quantum AI agent capable of instant financial arbitrage",
                "Enterprise cloud margins expand 42% as global developers migrate to Googol neural infrastructure.",
                "Bloomberg Parody",
                NewsImpact::Bullish,
                0.065,
                None,
                None,
            ),
            (
                "MATE",
                "Mate open-sources revolutionary 500B parameter neural model outperforming all rivals",
                "Metaverse daily active users surpass 100M milestone as lightweight smart glasses go viral.",
                "TechPulse Daily",
                NewsImpact::Bullish,
                0.070,
                None,
                None,
            ),
            (
                "XOMM",
                "XennonMobile strikes monumental 20-year LNG export pact with European utilities",
                "Crude spreads widen in favor of integrated refiners following surprise OPEC supply reduction.",
                "FinTimes",
                NewsImpact::Bullish,
                0.048,
                None,
                None,
            ),
            (
                "MS-M",
                "Sergei Manly posts record quarterly M&A advisory revenues in mega-cap tech sector",
                "Wealth management division crosses $6 Trillion AUM as institutional trading desks report blowout profits.",
                "Wall Street Wire",
                NewsImpact::Bullish,
                0.055,
                None,
                None,
            ),
            (
                "BA-E",
                "Baeing secures $24 Billion multi-carrier widebody jet commitment at international airshow",
                "FAA clears next-gen commercial jetliner for expedited certification trials.",
                "Aviation Global",
                NewsImpact::Bullish,
                0.072,
                None,
                None,
            ),
            (
                "CCN",
                "CCN shatters prime-time cable viewership records during high-stakes financial crisis debate",
                "Hostile buyout speculation drives media conglomerate shares higher as bidding war looms.",
                "Media Insider",
                NewsImpact::Bullish,
                0.082,
                None,
                None,
            ),
            (
                "AMBK",
                "American Bank net interest income beats Street consensus as retail deposit flight eases",
                "Federal Reserve stress test confirms Tier 1 capital buffer significantly exceeds mandatory cushions.",
                "Banking Bureau",
                NewsImpact::Bullish,
                0.042,
                None,
                None,
            ),
            (
                "BCLY",
                "Boreclay approves accelerated £2 Billion share repurchase program following blowout trading gains",
                "Transatlantic investment banking division captures market share from European peers.",
                "London Exchange Daily",
                NewsImpact::Bullish,
                0.058,
                None,
                None,
            ),
            (
                "PEAR",
                "John Ternas confirms titanium holographic PearBook shipments ramping up ahead of schedule",
                "Services revenue hits all-time record as ecosystem retention reaches 98%.",
                "Bloomberg Parody",
                NewsImpact::Bullish,
                0.055,
                Some("/ceo/john_ternas.jpg"),
                Some("John Ternas"),
            ),
            (
                "MHD",
                "Willy Bate announces MicroHard AI operating system integration across 1 Billion PCs",
                "Wall Street upgrades MHD price target citing recurring SaaS enterprise cash flows.",
                "Wall Street Journal Parody",
                NewsImpact::Bullish,
                0.060,
                Some("/ceo/willy_bate.jpg"),
                Some("Willy Bate"),
            ),
            (
                "TSLA-X",
                "Elon Mowsk reveals autonomous humanoid factory robot performing intricate electronics assembly",
                "Autonomous manufacturing demo convinces skeptical analysts on high-margin commercialization.",
                "Silicon Beat",
                NewsImpact::Bullish,
                0.090,
                Some("/ceo/elon_mowsk.jpg"),
                Some("Elon Mowsk"),
            ),
            (
                "PIXL",
                "James Huang confirms $60 Billion in confirmed enterprise backlog for Nvidiot AI chips",
                "Earnings visibility extends into next fiscal year with cloud data centers expanding orders.",
                "DeepTech Digest",
                NewsImpact::Bullish,
                0.085,
                Some("/ceo/james_huang.jpg"),
                Some("James Huang"),
            ),
        ];

        let (sym, headline, body, source, impact, shock, img, name) = templates.choose(rng).unwrap();
        let shock_variance = rng.gen_range(-0.01..0.01);

        NewsItem {
            id: format!("news-{}", timestamp),
            timestamp,
            headline: headline.to_string(),
            body: body.to_string(),
            source: source.to_string(),
            affected_symbol: Some(sym.to_string()),
            impact: *impact,
            shock_magnitude: shock + shock_variance,
            is_read: false,
            ceo_image: img.map(|s| s.to_string()),
            ceo_name: name.map(|s| s.to_string()),
        }
    }
}
