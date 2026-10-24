import type { NewsImpact, NewsItem } from '../types';

export interface CEODetails {
  name: string;
  role: string;
  companySymbol: string;
  image: string;
}

export const CEOS: Record<string, CEODetails> = {
  elon: {
    name: 'Elon Mowsk',
    role: 'Techno-King of MuskCar & Doge Emperor',
    companySymbol: 'TSLA-X',
    image: '/ceo/elon_mowsk.jpg',
  },
  willy: {
    name: 'Willy Bate',
    role: 'Founder & Chief Architect of MicroHard',
    companySymbol: 'MHD',
    image: '/ceo/willy_bate.jpg',
  },
  james: {
    name: 'James Huang',
    role: 'Leather Jacket CEO of Nvidiot',
    companySymbol: 'PIXL',
    image: '/ceo/james_huang.jpg',
  },
  john: {
    name: 'John Ternas',
    role: 'Hardware Engineering Tsar at Pear Inc.',
    companySymbol: 'PEAR',
    image: '/ceo/john_ternas.jpg',
  },
};

export class ProceduralNewsGenerator {
  private static newsCounter = 0;

  static generate(timestamp: number, preferredMode?: string): NewsItem {
    this.newsCounter++;
    const roll = Math.random();

    // 25% chance of CEO special event
    if (roll < 0.25) {
      return this.generateCEONews(timestamp);
    }

    // 40% chance of stock corporate event
    if (preferredMode === 'StockExchange' || roll < 0.65) {
      return this.generateCorporateNews(timestamp);
    }

    // Otherwise crypto market event
    return this.generateCryptoNews(timestamp);
  }

  private static generateCEONews(timestamp: number): NewsItem {
    const ceoKeys = ['elon', 'willy', 'james', 'john'];
    const key = ceoKeys[Math.floor(Math.random() * ceoKeys.length)];
    const ceo = CEOS[key];

    const templates = [
      {
        sym: ceo.companySymbol,
        headline: `${ceo.name} announces unexpected $15 Billion stock buyback live on air`,
        body: `During an unscripted interview on CCN, ${ceo.name} praised aggressive capital return to shareholders, sparking an immediate frenzy across institutional order books.`,
        source: 'CCN Live Wire',
        impact: 'Bullish' as NewsImpact,
        shock: 0.08 + Math.random() * 0.05,
      },
      {
        sym: ceo.companySymbol,
        headline: `${ceo.name} issues internal memo warning of 'unprecedented supply chain disruptions'`,
        body: `A leaked message from ${ceo.name} urges engineers to brace for component shortages through next fiscal quarter, prompting sudden profit-taking by hedge funds.`,
        source: 'Bloomberg Parody',
        impact: 'Bearish' as NewsImpact,
        shock: -(0.05 + Math.random() * 0.05),
      },
      {
        sym: ceo.companySymbol,
        headline: `${ceo.name} unveils next-generation prototype on stage to thunderous applause`,
        body: `Demonstrating revolutionary capabilities in front of tech analysts, ${ceo.name} declared competitors 'at least three product cycles behind our roadmap.'`,
        source: 'TechPulse Daily',
        impact: 'Bullish' as NewsImpact,
        shock: 0.07 + Math.random() * 0.06,
      },
      {
        sym: ceo.companySymbol,
        headline: `${ceo.name} faces formal regulatory investigation regarding pre-market options trading`,
        body: `Federal securities commissions opened an inquiry after unusual derivatives activity preceded yesterday's corporate restructuring announcement by ${ceo.name}.`,
        source: 'FinTimes Global',
        impact: 'Bearish' as NewsImpact,
        shock: -(0.06 + Math.random() * 0.04),
      },
    ];

    // Special Elon Twitter meme crypto pump template
    if (key === 'elon' && Math.random() > 0.5) {
      return {
        id: `news-ceo-${timestamp}-${this.newsCounter}`,
        timestamp,
        headline: `Elon Mowsk changes profile picture to MeowCoin wearing cyber sunglasses`,
        body: `Social media trading bots detected the avatar change in under 3 milliseconds, triggering an avalanche of 50x leverage perpetual long orders across MEOW exchanges.`,
        source: 'ChirpStream Breaking',
        affected_symbol: 'MEOW',
        impact: 'Bullish',
        shock_magnitude: 0.16 + Math.random() * 0.10,
        is_read: false,
        ceo_name: ceo.name,
        ceo_image: ceo.image,
      };
    }

    const t = templates[Math.floor(Math.random() * templates.length)];
    return {
      id: `news-ceo-${timestamp}-${this.newsCounter}`,
      timestamp,
      headline: t.headline,
      body: t.body,
      source: t.source,
      affected_symbol: t.sym,
      impact: t.impact,
      shock_magnitude: Math.round(t.shock * 1000) / 1000,
      is_read: false,
      ceo_name: ceo.name,
      ceo_image: ceo.image,
    };
  }

  private static generateCorporateNews(timestamp: number): NewsItem {
    const companies = [
      {
        sym: 'GOOG',
        name: 'Googol',
        bull: [
          'Googol launches autonomous Quantum AI agent capable of zero-latency financial arbitrage',
          'Cloud division margins surge 44% year-over-year as enterprise AI contracts double',
          'Department of Justice settles search antitrust case with minor administrative fine',
        ],
        bear: [
          'Googol hit with record €4.2 Billion European digital monopoly penalty',
          'Global advertising spend stalls as enterprise clients cut Q3 digital marketing budgets',
          'Critical vulnerability discovered in Googol Chrome core browser rendering engine',
        ],
      },
      {
        sym: 'MATE',
        name: 'Mate',
        bull: [
          'Mate releases open-source 500B parameter neural model beating all proprietary benchmarks',
          'Daily active metaverse users cross 100 Million threshold following lightweight VR glasses release',
          'Mate announces quarterly cash dividend initiation and $30B expanded share retirement',
        ],
        bear: [
          'Senate committee summons Mate leadership over algorithmic engagement and youth screen time',
          'Hardware lab reports $3.8 Billion quarterly operating burn on holographic device R&D',
          'Ad tracking privacy updates from mobile OS platforms reduce conversion efficiency by 12%',
        ],
      },
      {
        sym: 'XOMM',
        name: 'XennonMobile',
        bull: [
          'XennonMobile strikes monumental 20-year LNG export pact with transatlantic utilities',
          'OPEC+ unexpectedly reduces crude quotas by 1.5M barrels daily, lifting crack spreads',
          'Deepwater offshore basin delivers highest flow rate discovery in over two decades',
        ],
        bear: [
          'Carbon tax legislation advances in key industrial jurisdictions, threatening refinery margins',
          'Gulf Coast export terminal halted due to tropical storm infrastructure precautions',
          'Clean energy transition mandates force early amortization of legacy shale exploration leases',
        ],
      },
      {
        sym: 'MS-M',
        name: 'Sergei Manly',
        bull: [
          'Sergei Manly leads advisory league tables with record advisory fee revenue in mega-cap M&A',
          'Private wealth advisory assets under management surpass $6 Trillion milestone',
          'Dark-pool algorithmic execution desk reports highest quarterly trading gains in firm history',
        ],
        bear: [
          'Federal regulators mandate heightened supplementary capital reserves for Sergei Manly',
          'Syndicated leveraged buyout loans stuck on balance sheet amidst tightening debt markets',
          'Internal audit detects accounting irregularities at offshore sovereign trading desk',
        ],
      },
      {
        sym: 'BA-E',
        name: 'Baeing',
        bull: [
          'Baeing secures $28 Billion multi-carrier widebody jet commitment at international airshow',
          'Federal Aviation Agency clears supersonic passenger transport design for commercial trials',
          'Defense logistics unit wins classified fifth-generation unmanned escort fleet contract',
        ],
        bear: [
          'Emergency airworthiness directive issued following fuselage rivet inspections on new deliveries',
          'Factory floor machinists union votes 94% in favor of nationwide production walkout',
          'Global aerospace titanium supply chain bottleneck delays narrowbody deliveries by 6 months',
        ],
      },
      {
        sym: 'CCN',
        name: 'CCN',
        bull: [
          'CCN breaks prime-time viewership records during high-stakes election debate coverage',
          'Digital streaming subscription tiers turn operating profit two fiscal quarters ahead of forecast',
          'Hostile buyout rumor pushes media syndicate shares higher as private equity consortium circles',
        ],
        bear: [
          'Cable cord-cutting trends accelerate, reducing affiliate carriage fees across major operators',
          'High-profile prime-time anchor abruptly resigns following breach of contract controversy',
          'Advertisers pause television campaign spends amid broader economic uncertainty',
        ],
      },
      {
        sym: 'AMBK',
        name: 'American Bank',
        bull: [
          'American Bank net interest margin expands as prime lending rates rise faster than deposit costs',
          'Stress test results confirm Tier 1 capital adequacy ratio exceeds regulatory minimums by 450 bps',
          'Commercial real estate loan portfolio credit provisions come in well below Wall Street fears',
        ],
        bear: [
          'Consumer credit card 90-day delinquencies tick up to post-recession peaks among retail borrowers',
          'Subpoenas issued over regional commercial mortgage underwriting standards',
          'Automated wire and ATM network encounters intermittent 4-hour processing outage',
        ],
      },
      {
        sym: 'BCLY',
        name: 'Boreclay',
        bull: [
          'Boreclay transatlantic investment banking division posts blowout fixed income currency revenues',
          'Board approves accelerated £2 Billion capital return via ongoing open market tender',
          'European corporate treasury solutions unit wins mandate for sovereign green bond issuance',
        ],
        bear: [
          'European central bank levies compliance surcharge over legacy algorithmic trading controls',
          'UK mortgage origination volumes decline 18% as residential property buyer sentiment softens',
          'Foreign exchange arbitrage desk records unexpected trading loss on flash currency swings',
        ],
      },
    ];

    const c = companies[Math.floor(Math.random() * companies.length)];
    const isBull = Math.random() > 0.45;
    const headline = isBull
      ? c.bull[Math.floor(Math.random() * c.bull.length)]
      : c.bear[Math.floor(Math.random() * c.bear.length)];

    const bodies = [
      `Institutional desks reported heavy blocks crossing the tape within seconds of the headline hitting wire services.`,
      `Wall Street analysts promptly updated 12-month fair value price targets, citing altered risk-reward asymmetric upside.`,
      `Options implied volatility surged to the 95th percentile as retail market participants rushed to position for continuation.`,
      `Trading volume spiked over 300% above 30-day moving averages as algorithmic liquidity providers adjusted bid-ask spreads.`,
    ];

    const sources = ['Bloomberg Parody', 'Wall Street Gossip', 'FinTimes Wire', 'AlphaExchange Daily', 'CCN MarketFlash'];
    const shock = (isBull ? 1 : -1) * (0.04 + Math.random() * 0.05);

    return {
      id: `news-corp-${timestamp}-${this.newsCounter}`,
      timestamp,
      headline,
      body: bodies[Math.floor(Math.random() * bodies.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      affected_symbol: c.sym,
      impact: isBull ? 'Bullish' : 'Bearish',
      shock_magnitude: Math.round(shock * 1000) / 1000,
      is_read: false,
    };
  }

  private static generateCryptoNews(timestamp: number): NewsItem {
    const assets = [
      { sym: 'BYTE', name: 'Bytecoin' },
      { sym: 'AETH', name: 'Aethereum' },
      { sym: 'SOLA', name: 'Solona' },
      { sym: 'MEOW', name: 'MeowCoin' },
      { sym: 'USDF', name: 'USD-Fake' },
    ];

    const crypto = assets[Math.floor(Math.random() * assets.length)];
    const isBull = Math.random() > 0.48;

    const bullHeadlines = [
      `Global sovereign wealth fund allocates $2.5B into ${crypto.name} spot liquidity pools`,
      `Tier-1 institutional prime broker enables instant settlement for ${crypto.sym} spot pairs`,
      `Validator consortium votes unanimously to burn 5% of circulating ${crypto.sym} supply`,
      `Cross-chain bridge volume hits all-time high as liquidity migrates aggressively into ${crypto.name}`,
      `Derivatives exchange reports historic short squeeze liquidating $480M of bearish bets on ${crypto.sym}`,
    ];

    const bearHeadlines = [
      `Anonymous hacker drains $65M from top decentralized lending protocol on ${crypto.name}`,
      `Global regulatory taskforce proposes emergency bans on privacy-preserving ${crypto.sym} wallets`,
      `Whale wallet dormant since 2012 suddenly transfers 80,000 ${crypto.sym} to offshore exchange`,
      `Network latency spikes as gas fees soar to 500 Gwei amid memecoin mint congestion on ${crypto.name}`,
      `Derivatives platform triggers automatic deleveraging cascade following sudden order book vacuum`,
    ];

    const headline = isBull
      ? bullHeadlines[Math.floor(Math.random() * bullHeadlines.length)]
      : bearHeadlines[Math.floor(Math.random() * bearHeadlines.length)];

    const bodies = [
      `Perpetual swap funding rates spiked to historic extremes as retail chads rushed to ape in with max leverage.`,
      `On-chain telemetry reveals massive wallet outflows into cold storage, signaling strong institutional hodling.`,
      `Liquidation heatmap shows over 15,000 over-leveraged traders liquidated across derivative books in 15 minutes.`,
      `Social media sentiment indicators registered an extreme greed index score of 92 out of 100.`,
    ];

    const sources = ['CryptoWhale Wire', 'DeFi Defector', 'OnChain Insider', 'Terminal Alpha Alert', 'HypePulse Daily'];
    const shock = (isBull ? 1 : -1) * (0.06 + Math.random() * 0.08);

    return {
      id: `news-crypto-${timestamp}-${this.newsCounter}`,
      timestamp,
      headline,
      body: bodies[Math.floor(Math.random() * bodies.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      affected_symbol: crypto.sym,
      impact: isBull ? 'Bullish' : 'Bearish',
      shock_magnitude: Math.round(shock * 1000) / 1000,
      is_read: false,
    };
  }
}
