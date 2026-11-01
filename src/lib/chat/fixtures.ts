export type Confidence = "high" | "medium" | "low";

export type Citation = {
  label: string;
  kind: "market" | "region" | "product" | "period";
  href?: string;
  note?: string;
};

export type ChatFixture = {
  kind: "answer" | "abstention" | "error";
  answer: string;
  confidence: Confidence;
  confidenceNote: string;
  citations: Citation[];
};

const riskAnswer: ChatFixture = {
  kind: "answer",
  answer:
    "Four markets need attention this quarter. Germany and Argentina are off track; Spain and Japan are at risk.\n\nGermany is the largest exposure. Revenue landed materially below forecast from May onward, and the miss is concentrated in Atlas Core and Beacon Cloud. Argentina has the steepest decline, but on a much smaller revenue base.\n\nThe pattern is not uniform across Europe: France and the United Kingdom remain on track, so the regional total masks a country-level problem.",
  confidence: "high",
  confidenceNote:
    "Based on complete market KPIs and 24 periods of actuals. Status thresholds are deterministic.",
  citations: [
    { label: "Germany", kind: "market", href: "/analyst?market=de", note: "Off track" },
    { label: "Argentina", kind: "market", href: "/analyst?market=ar", note: "Off track" },
    { label: "Spain", kind: "market", href: "/analyst?market=es", note: "At risk" },
    { label: "Japan", kind: "market", href: "/analyst?market=jp", note: "At risk" },
    { label: "May–Oct 2026", kind: "period", note: "Recent six periods" },
  ],
};

const germanyAnswer: ChatFixture = {
  kind: "answer",
  answer:
    "The data confirms the dip, but it does not record why it happened. Germany's revenue fell below forecast from May 2026, with the largest gap in August. Atlas Core and Beacon Cloud account for most of the shortfall, while Cascade Suite held closer to plan.\n\nThat pattern is consistent with a demand or execution issue in the two largest products, but the dataset has no pipeline, pricing or churn fields. Treat the cause as unconfirmed rather than attributing it to a specific event.",
  confidence: "low",
  confidenceNote:
    "The observed variance is well supported. The cause is not present in the dataset, so this answer should not be read as a causal explanation.",
  citations: [
    { label: "Germany", kind: "market", href: "/analyst?market=de" },
    { label: "Atlas Core", kind: "product" },
    { label: "Beacon Cloud", kind: "product" },
    { label: "May–Oct 2026", kind: "period" },
  ],
};

const comparisonAnswer: ChatFixture = {
  kind: "answer",
  answer:
    "Europe is the larger region by revenue, but APAC is growing faster and is closer to plan.\n\nEurope's growth is dragged down by Germany and Spain, while the United Kingdom and France are carrying the region. APAC's attainment is stronger, although Japan is a drag and India is the clearest upside case.\n\nOn a risk-adjusted basis, Europe needs intervention first: its revenue base is larger, so the same percentage miss has a bigger portfolio impact.",
  confidence: "medium",
  confidenceNote:
    "Regional totals are complete. The judgement on where to intervene first depends on strategic weighting that is not in the data.",
  citations: [
    { label: "Europe", kind: "region" },
    { label: "APAC", kind: "region" },
    { label: "Germany", kind: "market", href: "/analyst?market=de" },
    { label: "Japan", kind: "market", href: "/analyst?market=jp" },
    { label: "India", kind: "market", href: "/analyst?market=in" },
  ],
};

const forecastMissAnswer: ChatFixture = {
  kind: "answer",
  answer:
    "The portfolio miss is concentrated rather than broad. Two markets, Germany and Argentina, account for most of the gap between actual and forecast revenue.\n\nBy product, Atlas Core and Beacon Cloud contribute the largest shortfall. The rest of the portfolio is broadly within tolerance, which means a portfolio-level fix would be the wrong response: the evidence points to targeted market and product reviews.\n\nThis is a revenue and forecast comparison only. The data cannot tell you whether the root cause is pipeline coverage, conversion, pricing or a forecast-setting problem.",
  confidence: "medium",
  confidenceNote:
    "Revenue and forecast comparisons are complete. Root-cause attribution is outside the dataset.",
  citations: [
    { label: "Germany", kind: "market", href: "/analyst?market=de" },
    { label: "Argentina", kind: "market", href: "/analyst?market=ar" },
    { label: "Atlas Core", kind: "product" },
    { label: "Beacon Cloud", kind: "product" },
    { label: "Oct 2026", kind: "period" },
  ],
};

const abstention: ChatFixture = {
  kind: "abstention",
  answer:
    "I can't answer that from this dataset. It contains actual, forecast and prior-year revenue through October 2026, but no forecast beyond that horizon and no forward pipeline.\n\nI can compare the latest actual against the latest plan, or show the 24-period trend for any market or product.",
  confidence: "low",
  confidenceNote:
    "The requested period is outside the dataset. I won't extrapolate a number.",
  citations: [
    { label: "Dataset horizon", kind: "period", note: "Ends Oct 2026" },
  ],
};

const errorFixture: ChatFixture = {
  kind: "error",
  answer:
    "The assistant could not complete that response. The stream ended before the final evidence event arrived.\n\nTry again, or verify the underlying market directly in the analyst view.",
  confidence: "low",
  confidenceNote:
    "This is a transport error, not a data answer. No conclusion should be drawn from it.",
  citations: [],
};

const fixtures: Array<{ matches: string[]; fixture: ChatFixture }> = [
  { matches: ["at risk", "risk this quarter", "which markets"], fixture: riskAnswer },
  { matches: ["germany", "german"], fixture: germanyAnswer },
  { matches: ["apac", "europe", "compare"], fixture: comparisonAnswer },
  { matches: ["forecast miss", "driving", "portfolio miss"], fixture: forecastMissAnswer },
  { matches: ["next quarter", "next year", "predict", "future", "beyond"], fixture: abstention },
  { matches: ["error", "fail"], fixture: errorFixture },
];

export function findFixture(question: string): ChatFixture {
  const normalized = question.toLowerCase();
  const matched = fixtures.find((entry) =>
    entry.matches.some((needle) => normalized.includes(needle)),
  );
  return matched?.fixture ?? abstention;
}

export const suggestedQuestions = [
  "Which markets are at risk this quarter, and why?",
  "Why did Germany's revenue dip?",
  "Compare APAC and Europe on growth and forecast attainment",
  "What's driving the portfolio's forecast miss?",
];
