// All copy sourced from ACMIIL_PMS_Content_Revamp_All_Pages.docx — teal (proposed) blocks only.
// Figures per the ACE PMS deck & July 2026 factsheets. All strategies as on 31 July 2026.

export const CONTACT = {
  email: 'pms@acm.co.in',
  phones: ['022-2858 3759', '022-2858 3758'],
  address: 'Pantomath Nucleus House, Saki-Vihar Road, Andheri (East), Mumbai: 400072',
  officeHours: '9 to 6 pm',
};

export const REGULATORY = {
  legalName: 'Asit C. Mehta Investment Interrmediates Ltd.',
  descriptor: 'A Pantomath Group Company',
  cin: 'U65990MH1993PLC075388',
  sebiPms: 'INP000005801',
  stockBroking: 'INZ000186336',
  stockBrokingMembers: 'Member: BSE — CM/DERIVATIVES/CD, NSE — CM/DERIVATIVES/CD',
  dp: 'IN-DP-685-2022',
  researchAnalyst: 'INH000016490',
  apmi: 'PMS-0019',
  footnote:
    'Disclaimer: Data as on 31 July 2026. Returns ≤1 year are absolute and >1 year are annualised TWRR, based on aggregate portfolio returns post fees and expenses; individual portfolio returns may vary. Past performance is not indicative of future results. Investments in securities are subject to market risks; read all related documents carefully before investing. PMS is intended solely for HNI/UHNI investors. Rankings are based on PMS Bazaar monthly reports and internal classification criteria, excluding strategies with a vintage of less than 3 years and AMCs with aggregate AUM below ₹200 crore.',
  links: {
    investorCharter: '/docs/investor-charter.pdf',
    investorGrievance: '/docs/investor-grievance.pdf',
    scores: 'https://scores.sebi.gov.in/',
    smartOdr: 'https://smartodr.in/',
    sebiOdrCircular:
      'https://www.sebi.gov.in/legal/master-circulars/dec-2023/master-circular-for-online-resolution-of-disputes-in-the-indian-securities-market_80236.html',
  },
};

export const HERO = {
  eyebrow:
    'ACE PMS · By Asit C. Mehta Investment Interrmediates Ltd. — A Pantomath Group Company',
  headlineLead: "Built to Ride India's Ascent to a ",
  headlineAccent: '$10 Trillion',
  headlineTail: ' Economy',
  subheadline:
    "Investing in businesses positioned to benefit from India's structural transformation.",
  primaryCta: 'Explore Our Strategies',
  secondaryCta: 'Schedule a Conversation',
  chip: '$10 Tn · India 2035+',
  rankingFootnote:
    "*Rankings as per internal classification based on PMS Bazaar Report for March '26; AMCs with min. AUM of ₹200 crore and vintage of more than 3 years considered.",
};

// Structural growth themes — the 8 pillars of India's transformation.
export const HERO_THEMES = [
  { icon: 'Landmark', label: 'Financialisation' },
  { icon: 'Factory', label: 'Manufacturing' },
  { icon: 'Cpu', label: 'Digitization, Cloud & AI Infrastructure' },
  { icon: 'ShoppingCart', label: 'Premium Consumption' },
  { icon: 'Leaf', label: 'Energy Transition' },
  { icon: 'TrendingUp', label: 'Services' },
];

export const CREDIBILITY_BAR = [
  {
    label: 'VINTAGE',
    value: '9',
    suffix: '+ yrs',
    text: 'Proven track record navigating multiple bull & bear cycles',
  },
  {
    label: 'PEER RANKING',
    value: 'Top 10',
    suffix: '',
    text: 'Ranked PMS schemes in 3-yr & 5-yr timeframes by PMS Bazaar*',
  },
  {
    label: 'ANNUALISED RETURN',
    value: '24',
    suffix: '%*',
    text: 'Annualised return across our strategies',
  },
  {
    label: 'PHILOSOPHY',
    value: 'SCALE',
    suffix: '',
    text: 'Structural growth, capital cycle, advantage, leadership & entry valuation — the foundation of every decision',
  },
];

export const HERITAGE = {
  title: 'Trust & Legacy of ACMIIL + Energy & Execution of Pantomath',
  body: "For four decades, the Asit C. Mehta name has stood for trust in Indian Services. That legacy is now paired with the Pantomath Group's research infrastructure and execution strength to build a sharper, stronger PMS — a strategic collaboration designed to create more value for investors.",
  stats: ['40+ years of heritage', "Backed by Pantomath's research and AIF platform"],
};

// Philosophy pillars — content of the 4-pillar grid, rendered in the dual-engine card style.
export const PHILOSOPHY_PILLARS = [
  {
    icon: 'Shield',
    title: 'Institutional Grade Quality',
    kicker: 'Governance First',
    description:
      'Skin in the game, absolute corporate governance, and capital allocation stewardship are non-negotiable filters.',
    rows: [
      { k: 'Promoter diligence', v: 'Forensic transaction review' },
      { k: 'Capital allocation history', v: '10-year review' },
      { k: 'Promoter pledge / auditor flags', v: 'Avoided outright' },
    ],
  },
  {
    icon: 'TrendingUp',
    title: 'Structural Scalability',
    kicker: 'Secular Tailwinds Focus',
    description:
      'Focusing on companies addressing massive multi-decade secular tailwinds. Market opportunities must be vast.',
    rows: [
      { k: 'Target industry growth', v: '≥1.5x of GDP' },
      { k: 'Pricing power', v: 'Strong brand stickiness' },
      { k: 'Business model', v: 'High fixed-cost leverage' },
    ],
  },
  {
    icon: 'DollarSign',
    title: 'Superb Financial Strength',
    kicker: '>20% Target ROCE/ROE',
    description:
      'Businesses must generate strong free cash flows and maintain stellar balance sheets to withstand economic cycles.',
    rows: [
      { k: 'Return on Capital Employed', v: 'Consistently high' },
      { k: 'Leverage', v: 'Net-debt free / conservative' },
      { k: 'Profit → cash conversion', v: 'High operational conversion' },
    ],
  },
  {
    icon: 'Lock',
    title: 'Margin of Safety',
    kicker: 'Active Valuation Discipline',
    description:
      'A great business is not a great investment if bought at bubble valuations. Disciplined entry valuations.',
    rows: [
      { k: 'Valuation anchor', v: 'DCF-guided forward multiples' },
      { k: 'Growth-adjusted pricing', v: 'PE / EV-EBITDA vs PEG' },
      { k: 'Risk-reward', v: 'Asymmetric profiles only' },
    ],
  },
];

export const GARP_TEASER = {
  title: 'Growth at a Reasonable Price',
  body: 'We buy high-quality, growing businesses — but only at sensible valuations. A GARP discipline, pioneered by Peter Lynch, sits at the core of every strategy we run.',
  points: [
    'High-growth industries with large, addressable markets',
    'Resilient, scalable businesses with durable moats',
    'Managements with strong capital allocation and minority-shareholder focus',
    'A focused 15–25 stock portfolio — agnostic to index weights, sector and theme',
  ],
};

export interface StrategyContent {
  id: string;
  tag: string;
  name: string;
  tagline: string;
  // Positioning broken into point statements — shown as check-cards.
  points: string[];
  keyFacts: { k: string; v: string }[];
  performanceNote: string;
  homeCard: { description: string; metric: string; metricLabel: string };
  /** Data date for this strategy's figures (mixed across strategies). */
  asOn: string;
  // Growth of ₹1 crore since inception. *Value fields are ₹ crore (numeric) for charting.
  growth: {
    strategy: string;
    benchmark: string;
    strategyValue: number;
    benchmarkValue: number;
    strategyCagr: number;
    benchmarkCagr: number;
  };
}

export const STRATEGIES: StrategyContent[] = [
  {
    id: 'multicap',
    tag: 'Flexicap',
    name: 'ACE Multicap',
    tagline: 'Built for balanced performance',
    points: [
      'Our flagship. Large-cap stability blended with mid- and small-cap growth for an optimal balance of consistency and compounding.',
      'Enables quick repositioning as valuations, liquidity, macro conditions and sector leadership evolve.',
      'Track record of 7%+ alpha since inception, and ranked Top Five PMS scheme in 3 & 5-yr by PMS Bazaar.*',
    ],
    keyFacts: [
      { k: 'Inception', v: '23 Aug 2018' },
      { k: 'Benchmark', v: 'BSE 500 TRI' },
      { k: 'Style', v: 'GARP' },
      { k: 'Risk', v: 'High' },
      { k: 'Horizon', v: '3–5 yrs' },
      { k: 'Minimum', v: '₹50 lakh' },
      { k: 'Fixed Fee', v: '2.5% of AUM' },
      { k: 'Hybrid Fee', v: '1.5% of AUM + 15% Performance Fee | 10% Hurdle | High Watermark' },
    ],
    performanceNote:
      'Since-inception TWRR 19.2% vs 12.7% for BSE 500 TRI; ~7%+ alpha; top-5 PMS in 3 & 5-yr by PMS Bazaar, FY26.* Full data on the Performance page.',
    homeCard: {
      description:
        'Large-cap stability blended with mid/small-cap growth. For balanced, long-term compounding.',
      metric: '19.2%',
      metricLabel: 'Since-inception TWRR*',
    },
    asOn: '31 Jul 2026',
    growth: {
      strategy: '₹4 Cr',
      benchmark: '₹2.6 Cr',
      strategyValue: 4.0,
      benchmarkValue: 2.6,
      strategyCagr: 19.2,
      benchmarkCagr: 12.7,
    },
  },
  {
    id: 'tentrillion',
    tag: 'Mid & Small Cap',
    name: 'ACE Ten Trillion Opportunities',
    tagline: "Built to ride India's ascent to a $10-trillion economy",
    points: [
      "A small–mid (SMID) strategy built to capture India's rise to a $10-trillion economy.",
      "Capturing India's structural shift from services-led growth to financialisation, manufacturing and digitisation.",
      'Track record of 7%+ alpha since inception, and ranked Top Ten in SMID schemes in 3 & 5-yr by PMS Bazaar.*',
    ],
    keyFacts: [
      { k: 'Inception', v: '29 Dec 2017' },
      { k: 'Benchmark', v: 'BSE 500 TRI' },
      { k: 'Style', v: 'GARP' },
      { k: 'Risk', v: 'High' },
      { k: 'Horizon', v: '3–5 yrs' },
      { k: 'Minimum', v: '₹50 lakh' },
      { k: 'Fixed Fee', v: '2.5% of AUM' },
      { k: 'Hybrid Fee', v: '1.5% of AUM + 15% Performance Fee | 10% Hurdle | High Watermark' },
    ],
    performanceNote:
      'Since-inception TWRR 19.5% vs 12.4% for BSE 500 TRI; ~7%+ alpha since inception; top-10 SMID PMS in 3 & 5-yr by PMS Bazaar, FY26.*',
    homeCard: {
      description:
        "Riding India's shift from consumption to infrastructure and manufacturing.",
      metric: '19.5%',
      metricLabel: 'Since-inception TWRR*',
    },
    asOn: '31 Jul 2026',
    growth: {
      strategy: '₹4.6 Cr',
      benchmark: '₹3.2 Cr',
      strategyValue: 4.6,
      benchmarkValue: 3.2,
      strategyCagr: 19.5,
      benchmarkCagr: 12.4,
    },
  },
  {
    id: 'multiasset',
    tag: 'Multi-Asset',
    name: 'ACE Multi-Asset',
    tagline: 'Asset-class diversification with an optional 0.5% monthly payout',
    points: [
      'Our Multi-Asset strategy invests across equity, fixed income, gold, silver and listed alternatives to participate across every market cycle.',
      'Dynamic asset allocation across uncorrelated asset classes, driven by valuations and market cycles, aims to reduce volatility while capturing opportunities.',
      'A proven track record of 5%+ alpha since inception, complemented by the No. 1 Multi-Asset PMS ranking across both 3-year and 5-year periods by PMS Bazaar.',
    ],
    keyFacts: [
      { k: 'Inception', v: '4 Oct 2018' },
      { k: 'Benchmark', v: 'Nifty Multi-Asset' },
      { k: 'Style', v: 'GARP' },
      { k: 'Risk', v: 'Moderate' },
      { k: 'Horizon', v: '3–5 yrs' },
      { k: 'Past payout', v: '6% (Annually)' },
      { k: 'Minimum', v: '₹1 crore' },
      { k: 'Fixed Fee', v: '2.5% of AUM' },
      { k: 'Hybrid Fee', v: '1.5% of AUM + 15% Performance Fee | 10% Hurdle | High Watermark' },
    ],
    performanceNote:
      'Since-inception TWRR 16.8% vs 11.6% for Nifty Multi-Asset; ~5%+ alpha since inception; No. 1 multi-asset PMS in 3 & 5-yr by PMS Bazaar, FY26.*',
    homeCard: {
      description:
        'Equity, debt and alternates in one portfolio, with an optional 0.5% monthly payout.',
      metric: '16.8%',
      metricLabel: 'Since-inception TWRR*',
    },
    asOn: '31 Jul 2026',
    growth: {
      strategy: '₹3.4 Cr',
      benchmark: '₹2.4 Cr',
      strategyValue: 3.4,
      benchmarkValue: 2.4,
      strategyCagr: 16.8,
      benchmarkCagr: 11.6,
    },
  },
];

export const TRACK_RECORD = {
  title: 'A track record measured in cycles, not quarters',
  body: 'Across our core strategies we have delivered roughly 6% post-fee alpha over benchmark across a near-decade vintage — returns measured across full market cycles, not quarters.*',
  tiles: [
    { value: '~9 yr', label: 'PMS vintage' },
    { value: '~6%', label: 'Post-fee alpha across core strategies*' },
    { value: 'Top-quartile', label: '3 & 5-yr PMS Bazaar rankings, FY26*' },
  ],
  disclaimer:
    'Past performance is not indicative of future results. Returns as on 31 July 2026. Subject to market risk. See Performance page for methodology and full disclosures.',
};

export const WHY_PILLARS = [
  {
    title: 'Process over personality',
    body: 'A framework crafted over four decades of market-cycle learning; returns come from repeatable process, not a single star manager.',
  },
  {
    title: 'A defined philosophy, applied with strict discipline',
    body: 'GARP across every strategy — governance, entry-valuation and capital-cycle as core filters.',
  },
  {
    title: 'Collective intelligence',
    body: "An investment committee with devil's-advocate review, over individual risk-taking.",
  },
  {
    title: 'An institutionalised research framework',
    body: 'Decision-making with clear accountability.',
  },
  {
    title: 'Governance, valuation and capital allocation',
    body: 'Core, non-negotiable filters behind every position.',
  },
  {
    title: 'Top-quartile performance',
    body: 'Both 3-yr and 5-yr timeframes (PMS Bazaar, FY26).*',
  },
];

export const SERVICE_EDGE = [
  { title: 'Trust & legacy', body: '40+ years in financial services' },
  { title: 'Track record', body: 'A near-decade PMS vintage of alpha*' },
  { title: 'Relationships', body: 'Strong connect with promoters and managements' },
  { title: 'Customisation', body: 'Bespoke solutions for HNI/UHNI investors' },
  { title: 'Recognition', body: 'Ranked among the top by PMS Bazaar*' },
  { title: 'Engagement', body: 'Regular, transparent client reviews' },
];

export const FEES = {
  title: 'Transparent, simple terms',
  points: [
    'Minimum investment: ₹50 lakh (₹1 crore for Multi-Asset)',
    'Fee options: 2.5% of AUM flat, or 1.5% + 15% performance fee over a 10% hurdle with high-water-mark',
    'No lock-in; exit load 1% up to 1 year',
    'Paperless digital onboarding; regular engagement & reviews',
  ],
  custodian:
    'Custodian & fund accounting: Orbis Financial Corporation Ltd. Full schedule of charges available in Resources.',
};

export const PMS_EXPLAINER = {
  title: "New to PMS?",
  body: 'A Portfolio Management Service gives you a tailor-made portfolio of direct securities, managed by a SEBI-registered portfolio manager to your risk and return goals. Versus mutual funds, PMS offers greater transparency, customisation and direct ownership — designed for investors with ₹50 lakh or more to deploy.',
  tiles: [
    { title: 'Direct ownership & transparency', body: 'Securities held in your own name, with full transparency.' },
    { title: 'Customised to your goals', body: 'A portfolio aligned to your goals, horizon and risk appetite.' },
    { title: 'Managed by SEBI-registered experts', body: 'Run by a SEBI-registered portfolio manager and research team.' },
  ],
};

export const GETTING_STARTED = {
  title: 'Investing with us is Straightforward',
  steps: [
    { title: 'Talk to a specialist', body: 'A short conversation on goals, risk and corpus.' },
    { title: 'Choose your strategy', body: 'Aligned to your objective and horizon.' },
    { title: 'Digital onboarding', body: 'Paperless account opening.' },
    { title: 'Ongoing engagement', body: 'Regular reviews and transparent reporting.' },
  ],
  facts: [
    { k: 'MINIMUM INVESTMENT', v: '₹50 lakh (₹1 crore for Multi-Asset)' },
    { k: 'LOCK-IN', v: 'None' },
    { k: 'EXIT LOAD', v: '1% up to 1 year' },
    { k: 'FEE OPTIONS', v: '2.5% flat, or 1.5% + 15% over a 10% hurdle*' },
  ],
};

export const FAQS = [
  {
    q: 'What is the minimum investment?',
    a: "₹50 lakh for our equity strategies, and ₹1 crore for ACE Multi-Asset, in line with SEBI's minimum for PMS.",
  },
  {
    q: 'What are the fees, and is there a lock-in?',
    a: 'You can choose a flat 2.5% of AUM, or a 1.5% base plus a 15% performance fee over a 10% hurdle with a high-water-mark. There is no lock-in. An exit load of 1% applies for withdrawals within the first year.*',
  },
  {
    q: 'Can NRIs invest in PMS?',
    a: 'Yes. NRIs can invest after opening a PIS (Portfolio Investment Scheme) account as per RBI regulation.',
  },
  {
    q: 'Can I open an account with existing shares?',
    a: 'Yes. You can fund the account with a combination of cash and securities. Existing holdings are re-aligned to the model portfolio.',
  },
  {
    q: 'Can I withdraw partially?',
    a: 'Yes, provided your portfolio value stays above the applicable minimum. Portfolio managers cannot impose a lock-in, though an early-exit load may apply.',
  },
  {
    q: 'How often will I hear from you?',
    a: 'You receive regular, transparent reporting and periodic reviews with your relationship team. Reach us at pms@acm.co.in or 022-2858 3759.',
  },
];

// ---------- About ----------
export const ABOUT = {
  hero: {
    title: 'A Pantomath Group Company, Full-service Financial Conglomerate.',
    sub: 'An established capital market platform backed by 40+ years of legacy in Institutional Equities, Retail Broking and Distribution.',
    equation: [
      'Trust & Legacy of ACMIIL',
      'Energy & Execution of Pantomath',
      'A sharper, stronger PMS business',
    ],
  },
  groupStructure: {
    eyebrow: 'THE GROUP BEHIND THE PLATFORM',
    title: 'A Pantomath Group Company',
    tagline: ['12 Years of Progress', 'Backed by 40+ years of legacy.'],
    entities: [
      {
        name: 'Asit C. Mehta Investment Interrmediates Ltd.',
        monogram: 'ACE',
        logo: '/logos/investmentz-trim.png',
        short:
          '40+ years in Institutional Equities, Retail Broking and Portfolio Management Services. SEBI-registered PMS (Reg. No. INP000005801).',
        credential:
          'Strong and established platform of 40+ years in Institutional Equities, Retail Broking and Portfolio Management Services.',
        primary: true,
        badge: 'ACE PMS',
        caption:
          'ACE PMS is the SEBI-registered portfolio management platform of ACMIIL (Reg. No. INP000005801).',
      },
      {
        name: 'Wealth Company Asset Management Pvt. Ltd.',
        monogram: 'WC',
        logo: '/logos/wc-alternates-trim.png',
        short: 'Bharat Value Fund across its series manages ~₹7,000 crore in client assets.',
        credential:
          'Bharat Value Fund across various series manages ~₹7,000 crores in client assets.',
      },
      {
        name: 'Wealth Company Asset Management Holdings Pvt. Ltd.',
        monogram: 'WCH',
        logo: '/logos/wc-mutualfund-trim.png',
        short:
          "India's first female-founded mutual fund house; ₹2,000 cr in debut NFO collections.",
        credential:
          "India's first female-founded mutual fund house; launched four active funds simultaneously in 2025; ₹2,000 cr in debut NFO collections.",
      },
      {
        name: 'Pantomath Capital Advisors Pvt. Ltd.',
        monogram: 'PCA',
        logo: '/logos/pantomath-tm.jpg',
        short: 'Full-service investment bank — IPOs, QIPs, M&A and PE advisory; 150+ ECM deals.',
        credential:
          'Leading full-service investment bank — IPOs, QIPs, M&A, PE advisory; 150+ ECM transactions executed to date.',
      },
    ],
  },
  scale: {
    serviceLines: [
      'Portfolio Management',
      'Institutional Equities',
      'Stock Broking',
      'Asset Management',
      'Wealth Management',
      'Investment Banking',
    ],
    stats: [
      { icon: 'Users', value: 600, suffix: '+', label: 'Team, Human Capital' },
      { icon: 'Building2', value: 200, suffix: '+', label: 'Franchise Offices' },
      { icon: 'MapPin', value: 114, suffix: '', label: 'Cities across 20+ states' },
    ],
    footnote: '',
  },
  leadership: {
    title: 'Leadership',
    name: 'CA. Prathmesh Agrawal',
    role: 'President & Fund Manager',
    photo: '/team/Professional Picture.png',
    // Paragraphs; wrap a phrase in *asterisks* to render it emphasised (bold).
    bio: [
      'Mr. Prathmesh Agrawal is a seasoned Portfolio Management Services (PMS) professional with over 15 years of experience in the Indian listed equity markets. He has managed and advised investment portfolios with aggregate Assets Under Management (AUM) exceeding ₹1,000 crore.',
      "A Qualified Chartered Accountant, he has extensive expertise in Portfolio Management, Investment Strategy, Equity Research, and Risk Management. Over the course of his career, he has been associated with leading financial institutions, including Enam Asset Management, Religare Group, Varanium Capital, and Moody's Analytics, where he contributed to investment research, portfolio construction, and strategic investment decision-making.",
    ],
    timeline: ["Moody's Analytics", 'Religare', 'Varanium Group', 'Enam AMC', 'Asit C. Mehta Investment Interrmediates Ltd.'],
    closingLine: '',
  },
  cta: {
    title: 'Four decades of heritage. One disciplined platform.',
  },
};

// ---------- Philosophy & Process ----------
export const PHILOSOPHY_PAGE = {
  heroTitle: 'Growth at a Reasonable Price — what we believe before we invest',
  heroBody:
    'We seek high-quality, growing businesses available at reasonable valuations — the GARP discipline pioneered by Peter Lynch.',
  beliefs: [
    'Invest in high-growth industries with a large, structurally addressable market (TAM)',
    'Own resilient, scalable businesses with enduring competitive advantages and moats',
    'Back managements with a strong capital-allocation and efficiency track record',
    'Favour minority-shareholder-friendly companies with a sharp focus on return on capital',
    'Run a focused 18–25 stock portfolio, agnostic to market cap, sector and theme',
    'Avoid over-diversification and consensus-driven ideas; keep churn moderate',
  ],
  coreSatellite: {
    title: 'A Core–Satellite Strategy',
    core: {
      title: 'Core (75–80%)',
      body: 'The anchor of the portfolio — stable, consistent compounders held 1–3 years, meeting our GARP screens: earnings/revenue growth ≥12%, debt-to-equity ≤2, PEG ≤2, and positive operating cash flow.',
    },
    satellite: {
      title: 'Satellite (20–25%)',
      body: 'Tactical, special-situation positions held under 12 months to enhance alpha — special-event and momentum opportunities such as management change, merger/demerger, seasonal or cyclical shifts, and supply–demand dislocations.',
    },
  },
  process: {
    title: 'A repeatable, committee-driven process',
    steps: [
      {
        title: 'Quality of Business',
        body: 'Strong moats, room for share/margin gains, secular growth, high entry barriers.',
      },
      {
        title: 'Quality of Management',
        body: 'Growth-oriented, minority-friendly, good governance, low promoter pledge and related-party transactions.',
      },
      {
        title: 'Quality of Earnings',
        body: 'Organic growth, efficient capital allocation, EPS/revenue growth >12%, EBITDA-to-cash conversion, ROCE >12%, low leverage.',
      },
      {
        title: 'Investment Thesis',
        body: 'Business-model deep-dive, financial modelling, stress-testing, peer and valuation-band analysis.',
      },
      {
        title: 'Investment Committee',
        body: "Idea challenged by FM + analyst, devil's-advocate check, risk–return and framework-fitness tests.",
      },
    ],
    note: 'Management meetings support the process but are not a pre-requisite.',
  },
  screening: {
    title: 'Every business earns its place',
    intro:
      'We filter a universe of 1,000+ businesses down to a portfolio of 15–25 — durable, scalable, fundamentally sound companies:',
    filters: [
      { title: 'Universe', body: 'BSE 1000 + select IPOs and companies' },
      { title: 'Qualitative', body: 'Governance, promoter track record, capital-allocation history' },
      { title: 'Scalability', body: 'Industry growth and longevity, TAM, competitive advantage and moats' },
      { title: 'Quantitative', body: 'Market cap > ₹1,000 cr, earnings/revenue growth > 12%, ROCE > 12%, positive CFO' },
      { title: 'Valuation', body: 'PEG, P/B vs. ROE spread, 3 & 5-yr PE bands, reverse DCF' },
      { title: 'Construction', body: '15–25 stocks, position-sized on risk-adjusted return potential' },
    ],
  },
  entryExit: {
    title: 'Disciplined entry, staggered exits, active rebalancing',
    body: 'Positions are built and trimmed against valuation bands and thesis milestones — staggered entry points on valuation comfort, and disciplined exits as targets are met or the thesis changes — with periodic rebalancing to manage risk limits.',
  },
  risk: {
    title: "Risk management isn't an add-on — it's embedded",
    items: [
      'Single-stock exposure capped at 10% (at cost/initiation)',
      'Single-sector exposure monitored below 35%',
      'Diversification across 10+ sectors and 5+ themes to control beta risk',
      'Thematic allocation reviewed for concentration; periodic rebalancing to hold risk limits',
    ],
  },
  avoid: {
    title: 'Avoiding pitfalls — what we don\'t do',
    items: [
      'High promoter pledge (typically >30%)',
      'Persistently weak or negative operating cash conversion',
      "'Buy at any price' — typically companies with PEG > 2",
      'Over-levered balance sheets (debt-to-equity ≥3 or interest coverage ≤1.5)',
      'Hot themes and market buzz where narrative is stronger than earnings',
      'Ultra short-term trading and high churn (≥50%)',
    ],
  },
};

// ---------- Performance ----------
export const PERFORMANCE = {
  intro: {
    title: 'Performance, in full',
    body: 'All figures are as on 31 July 2026. Returns up to 1 year are absolute; beyond 1 year are annualised (TWRR). Figures are based on model client portfolios, post-expenses; individual portfolio returns may vary. Past performance is not indicative of future results. Investments are subject to market risk.',
  },
  // TWRR %, as on 31 July 2026
  tables: [
    {
      strategy: 'ACE Multicap',
      since: 'since 23 Aug 2018',
      benchmarkName: 'BSE 500 TRI',
      rows: {
        portfolio: [10.2, 24.3, 23.4, 19.2],
        benchmark: [3.0, 11.9, 12.4, 12.7],
        alpha: [7.2, 12.4, 11.0, 6.5],
      },
    },
    {
      strategy: 'ACE Ten Trillion Opportunities',
      since: 'since 29 Dec 2017',
      benchmarkName: 'BSE 500 TRI',
      rows: {
        portfolio: [19.8, 26.7, 24.8, 19.5],
        benchmark: [3.0, 11.9, 12.4, 12.4],
        alpha: [16.8, 14.8, 12.4, 7.1],
      },
    },
    {
      strategy: 'ACE Multi-Asset',
      since: 'since 04 Oct 2018',
      benchmarkName: 'Nifty Multi-Asset',
      rows: {
        portfolio: [11.6, 21.8, 19.9, 16.8],
        benchmark: [6.0, 10.9, 10.2, 11.6],
        alpha: [5.6, 10.9, 9.7, 5.2],
      },
    },
  ],
  tableNote:
    'Data as on 31 July 2026. Returns ≤1 year are absolute and >1 year are annualised TWRR, based on aggregate portfolio returns post fees and expenses; individual portfolio returns may vary. Past performance is not indicative of future results. Investments in securities are subject to market risks; read all related documents carefully before investing.',
  // Growth of ₹1 crore since inception. Values in ₹ crore.
  growth: [
    {
      strategy: 'ACE Multicap',
      terminalValue: 4.0,
      benchmarkValue: 2.6,
      benchmarkName: 'BSE 500 TRI',
      inception: '23 Aug 2018',
      asOn: '31 Jul 2026',
    },
    {
      strategy: 'ACE Ten Trillion',
      terminalValue: 4.6,
      benchmarkValue: 3.2,
      benchmarkName: 'BSE 500 TRI',
      inception: '29 Dec 2017',
      asOn: '31 Jul 2026',
    },
    {
      strategy: 'ACE Multi-Asset',
      terminalValue: 3.4,
      benchmarkValue: 2.4,
      benchmarkName: 'Nifty Multi-Asset',
      inception: '04 Oct 2018',
      asOn: '31 Jul 2026',
    },
  ],
  growthNote:
    'Since inception, all figures as on 31 July 2026. Returns are annualised (TWRR) and net of expenses. Past performance is not indicative of future returns.',
  rankings: {
    title: 'PMS Bazaar rankings, FY26',
    header: ['Strategy', '1-Yr rank', '3-Yr rank', '5-Yr rank'],
    rows: [
      ['ACE Multicap', '25 / 143', '4 / 143', '1 / 112'],
      ['ACE Multi-Asset', '5 / 13', '1 / 13', '1 / 8'],
      ['ACE Ten Trillion Opportunities', '15 / 56', '7 / 56', '11 / 48'],
    ],
    note: 'PMS Bazaar rankings for relevant schemes with minimum 3-yr vintage and AMCs with minimum ₹200 cr AUM, as on 31 March 2026.',
  },
};

// ---------- Insights ----------
export const INSIGHTS_CATEGORIES = [
  { title: 'Strategy commentary', body: 'What drove each portfolio, tied to the monthly factsheets' },
  { title: 'In the media', body: 'Interviews, quotes and press mentions' },
];

export const INSIGHT_PLACEHOLDERS = [
  {
    category: 'Strategy commentary',
    title: 'What drove our portfolios this month',
    summary: 'Strategy-wise commentary tied to the monthly factsheets — attribution, changes and outlook.',
    date: 'June 2026',
    readTime: '6 min',
  },
  {
    category: 'In the media',
    title: 'ACE PMS in the press',
    summary: 'Interviews, quotes and coverage of our strategies and market views.',
    date: 'June 2026',
    readTime: '3 min',
  },
];

// ---------- Media coverage ----------
export interface MediaItem {
  title: string;
  source: string;
  kind: 'link' | 'pdf' | 'video';
  href: string;
  date: string;
  /** Short feature / description line shown under the title. */
  excerpt?: string;
  /** Cover image (themed stock photo; falls back to a brand card if it fails). */
  cover: string;
}

export const MEDIA_COVERAGE: { intro: string; items: MediaItem[] } = {
  intro: 'Press coverage, rankings and alpha newsletters featuring ACE PMS.',
  items: [
    {
      title: 'Top 10 Portfolio Management Schemes — November 2025',
      source: 'Moneycontrol',
      kind: 'link',
      href: 'https://www.moneycontrol.com/news/photos/business/markets/top-10-portfolio-management-schemes-for-the-month-of-november-2025-13737432-1.html',
      date: 'Nov 2025',
      cover: '/media/covers/uptrend.jpg',
    },
    {
      title: 'Microfinance recovery delivers big alpha for this PMS fund',
      source: 'Moneycontrol',
      kind: 'link',
      href: 'https://www.moneycontrol.com/news/business/markets/microfinance-recovery-delivers-big-alpha-for-this-pms-fund-near-90-concentrated-bet-14014233.html',
      date: '2026',
      cover: '/media/covers/advisor.jpg',
    },
    {
      title: 'Small- and mid-cap stocks powering the best-performing PMSes',
      source: 'Moneycontrol',
      kind: 'link',
      href: 'https://www.moneycontrol.com/news/photos/business/personal-finance/midcap-and-smallcap-stocks-that-drove-the-top-performing-pms-12804623.html',
      date: '24 Aug 2024',
      excerpt: 'Includes ACE Multicap and ACE Midcap.',
      cover: '/media/covers/chart-rising.jpg',
    },
    {
      title: 'Crorepati investors make up to 120% return with PMS funds',
      source: 'Economic Times',
      kind: 'link',
      href: 'https://m.economictimes.com/markets/stocks/news/crorepati-investors-make-up-to-120-return-with-pms-funds/asit-c-mehta-investment-intermediates/slideshow/111729752.cms',
      date: '14 Jul 2024',
      excerpt: 'ACE Multicap and ACE Midcap featured in the slideshow.',
      cover: '/media/covers/analytics-dashboard.jpg',
    },
    {
      title: 'Four investment themes from a fund manager who delivered 102% in a year',
      source: 'Moneycontrol',
      kind: 'link',
      href: 'https://www.moneycontrol.com/news/business/markets/four-investment-themes-from-a-fund-manager-who-delivered-102-returns-in-one-year-12717521.html',
      date: '08 May 2024',
      excerpt: 'Interview with Prasanna Pathak on ACE Multicap and investment themes.',
      cover: '/media/covers/research-desk.jpg',
    },
    {
      title: '3 PMS funds doubled HNI investor wealth in FY24',
      source: 'Economic Times',
      kind: 'link',
      href: 'https://economictimes.indiatimes.com/markets/stocks/news/3-pms-funds-doubled-hni-investor-wealth-in-fy24-stars-missing-in-top-10-list/articleshow/109300870.cms',
      date: '15 Apr 2024',
      excerpt: 'Features ACE Multicap and ACE Midcap.',
      cover: '/media/covers/skyline.jpg',
    },
    {
      title: 'PMS Tracker: 22 PMS schemes gave double-digit returns last month',
      source: 'Economic Times',
      kind: 'link',
      href: 'https://m.economictimes.com/markets/stocks/news/pms-tracker-22-pms-schemes-gave-double-digit-returns-last-month/articleshow/107614842.cms',
      date: '12 Feb 2024',
      excerpt: 'Mentions both strategies’ January 2024 performance.',
      cover: '/media/covers/laptop-dashboard.jpg',
    },
    {
      title: 'How top PMSes delivered alpha to investors',
      source: 'The Hindu Business Line',
      kind: 'link',
      href: 'https://www.thehindubusinessline.com/portfolio/big-story/tulsian-asit-c-mehta-icici-pru-green-lantern-sundaram-heres-how-top-pmses-delivered-alpha-to-investors/article71262231.ece',
      date: '31 Jul 2026',
      excerpt: 'Tulsian, Asit C. Mehta, ICICI Pru, Green Lantern, Sundaram — big-story feature.',
      cover: '/media/covers/devices-trading.jpg',
    },
    {
      title: "ACE PMS: Built to Ride India's Ascent to a Ten Trillion Economy",
      source: 'YouTube',
      kind: 'video',
      href: 'https://youtu.be/ZYAw2FX2mfw?si=gKdAcexoWpead4NH',
      date: '',
      cover: '/media/Media.jpg',
    },
    {
      title: 'PMS Alpha Newsletter — June 2026',
      source: 'PMS AIF World',
      kind: 'pdf',
      href: '/media/PMS-AIF-WORLD-June2026-PMS-Performance-Alpha-Newsletter.pdf',
      date: 'Jun 2026',
      cover: '/media/covers/chart-rising.jpg',
    },
    {
      title: 'PMS Alpha Newsletter — March 2026',
      source: 'PMS AIF World',
      kind: 'pdf',
      href: '/media/PMS-AIF-WORLD-March2026-PMS-Alpha-Newsletter.pdf',
      date: 'Mar 2026',
      cover: '/media/covers/analytics-dashboard.jpg',
    },
    {
      title: 'PMS Alpha Newsletter — December 2025',
      source: 'PMS AIF World',
      kind: 'pdf',
      href: '/media/PMS-AIF-World-Dec-2025-Alpha-PMS-Newsletter.pdf',
      date: 'Dec 2025',
      cover: '/media/covers/devices-trading.jpg',
    },
    {
      title: 'PMS Bazaar × CRISIL Ranking — March 2023',
      source: 'PMS Bazaar',
      kind: 'pdf',
      href: '/media/PMSBazaar-Crisil-Ranking-March-2023.pdf',
      date: 'Mar 2023',
      cover: '/media/covers/skyline.jpg',
    },
    {
      title: 'PMS Bazaar Ranking — December 2022',
      source: 'PMS Bazaar',
      kind: 'pdf',
      href: '/media/PMSBazaar-PMS-Ranking-December22.pdf',
      date: 'Dec 2022',
      cover: '/media/covers/research-desk.jpg',
    },
    {
      title: 'PMS Bazaar Ranking — June 2022',
      source: 'PMS Bazaar',
      kind: 'pdf',
      href: '/media/PMSBazaar-PMS-Ranking-Jun22.pdf',
      date: 'Jun 2022',
      cover: '/media/covers/laptop-dashboard.jpg',
    },
  ],
};

// ---------- Resources ----------
export const RESOURCES = {
  title: 'Everything in One Place',
  // `categories` map each display card to the CMS document categories it pulls
  // from (the Console manages docs under those categories). `items` is the
  // fallback shown when a card has no uploaded documents yet.
  groups: [
    {
      title: 'Factsheets & Product Deck',
      body: 'Latest monthly factsheets and the strategy deck',
      categories: ['Monthly factsheets', 'Product decks'],
      items: [
        'ACE Multicap — July 2026',
        'ACE Ten Trillion — July 2026',
        'ACE Multi-Asset — July 2026',
        'ACE PMS Product Deck',
      ],
    },
    {
      title: 'Compliance & Disclosures',
      body: 'Regulatory documents and investor protections',
      categories: ['Compliance & disclosures'],
      items: ['Investor Charter', 'SEBI Disclosure Document', 'Fee illustration', 'Investor Grievance'],
    },
  ],
};
