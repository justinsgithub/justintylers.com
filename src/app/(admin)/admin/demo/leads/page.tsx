"use client";

const STATES = [
  { name: "Texas", leads: 218_400, sources: 4, enriched: 78 },
  { name: "Florida", leads: 195_200, sources: 5, enriched: 82 },
  { name: "California", leads: 172_800, sources: 6, enriched: 71 },
  { name: "New York", leads: 134_600, sources: 3, enriched: 69 },
  { name: "Pennsylvania", leads: 98_400, sources: 3, enriched: 85 },
  { name: "Ohio", leads: 87_200, sources: 2, enriched: 88 },
  { name: "Georgia", leads: 82_100, sources: 3, enriched: 76 },
  { name: "North Carolina", leads: 76_500, sources: 2, enriched: 74 },
  { name: "Virginia", leads: 68_900, sources: 3, enriched: 81 },
  { name: "Illinois", leads: 62_400, sources: 2, enriched: 77 },
  { name: "Michigan", leads: 54_800, sources: 2, enriched: 83 },
  { name: "New Jersey", leads: 48_200, sources: 2, enriched: 79 },
  { name: "Connecticut", leads: 38_600, sources: 2, enriched: 86 },
  { name: "Maryland", leads: 34_200, sources: 2, enriched: 80 },
  { name: "Arizona", leads: 27_700, sources: 1, enriched: 73 },
];

const TOTAL_LEADS = STATES.reduce((sum, s) => sum + s.leads, 0);
const TOTAL_SOURCES = STATES.reduce((sum, s) => sum + s.sources, 0);
const MAX_LEADS = Math.max(...STATES.map((s) => s.leads));

const PIPELINE = [
  { step: "Source Discovery", value: "42", label: "sources found" },
  { step: "Data Extraction", value: "1.4M", label: "raw records" },
  { step: "Normalization", value: "1", label: "standard format" },
  { step: "Phone Enrichment", value: "78%", label: "avg match rate" },
  { step: "Deduplication", value: "12%", label: "duplicates removed" },
  { step: "CRM Import", value: "1.4M", label: "clean leads" },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function LeadsDemoPage() {
  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Lead Generation Platform
        </p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Contractor Leads Overview
        </h1>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={formatNumber(TOTAL_LEADS)}
          detail="and counting"
          accent
        />
        <StatCard label="States" value="15" detail="active sources" />
        <StatCard label="Data Sources" value={TOTAL_SOURCES.toString()} detail="scrapers built" />
        <StatCard label="Avg Match Rate" value="78%" detail="phone enrichment" />
      </div>

      {/* Pipeline */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Data Pipeline
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PIPELINE.map((p, i) => (
            <div
              key={p.step}
              className="relative rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Step {i + 1}
              </div>
              <div className="text-xl font-bold text-foreground">{p.value}</div>
              <div className="text-xs text-muted-foreground">{p.label}</div>
              <div className="mt-2 text-[11px] font-medium text-primary">
                {p.step}
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="absolute -right-2 top-1/2 z-10 hidden text-muted-foreground/40 lg:block">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leads by State */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Leads by State
        </h2>
        <div className="space-y-2">
          {STATES.map((state) => (
            <div
              key={state.name}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/20"
            >
              <div className="w-32 shrink-0">
                <div className="text-sm font-medium text-foreground">
                  {state.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {state.sources} {state.sources === 1 ? "source" : "sources"}
                </div>
              </div>

              {/* Bar */}
              <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-muted/30">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary/70 transition-all group-hover:bg-primary"
                  style={{ width: `${(state.leads / MAX_LEADS) * 100}%` }}
                />
                <div className="absolute inset-y-0 flex items-center px-3">
                  <span className="text-xs font-semibold text-foreground drop-shadow-sm">
                    {formatNumber(state.leads)}
                  </span>
                </div>
              </div>

              {/* Enrichment rate */}
              <div className="w-20 shrink-0 text-right">
                <div className="text-sm font-semibold text-foreground">
                  {state.enriched}%
                </div>
                <div className="text-[10px] text-muted-foreground">
                  enriched
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speed comparison */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Before AI
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            100,000
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            leads in 1 month
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted/30">
            <div className="h-2 w-[20%] rounded-full bg-muted-foreground/40" />
          </div>
        </div>
        <div className="rounded-lg border border-primary/30 bg-card p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-primary">
            With AI
          </div>
          <div className="mt-2 text-3xl font-bold text-primary">400,000</div>
          <div className="mt-1 text-sm text-muted-foreground">
            leads in 1 week
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted/30">
            <div className="h-2 w-full rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        accent
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-3xl font-bold ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}
