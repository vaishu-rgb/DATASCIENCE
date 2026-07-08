import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import heroImg from "@/assets/hero-home.jpg";
import {
  AMENITY_LABELS,
  CONDITION_LABELS,
  LOCATION_LABELS,
  MODEL_METRICS,
  explainPrice,
  predictPrice,
  type AmenityKey,
  type Condition,
  type HouseFeatures,
  type Location,
} from "@/lib/price-model";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estate Oracle — House Price Prediction" },
      {
        name: "description",
        content:
          "Predict housing prices instantly using a regression model trained on location, size, rooms, and amenities.",
      },
      { property: "og:title", content: "Estate Oracle — House Price Prediction" },
      {
        property: "og:description",
        content:
          "A regression-based estimator for real estate. Enter location, size, rooms and amenities to get a price in seconds.",
      },
    ],
  }),
  component: Index,
});

const AMENITY_KEYS: AmenityKey[] = [
  "pool",
  "garden",
  "fireplace",
  "gym",
  "smartHome",
  "solar",
  "view",
];

const USD_TO_INR = 83;

const fmt = (n: number) => {
  const inr = n * USD_TO_INR;
  if (inr >= 1_00_00_000) return `₹${(inr / 1_00_00_000).toFixed(2)} Cr`;
  if (inr >= 1_00_000) return `₹${(inr / 1_00_000).toFixed(2)} L`;
  return inr.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

function Index() {
  const [features, setFeatures] = useState<HouseFeatures>({
    location: "suburb",
    sqft: 1800,
    bedrooms: 3,
    bathrooms: 2,
    age: 12,
    garage: 1,
    condition: "good",
    amenities: ["fireplace", "garden"],
  });

  const price = useMemo(() => predictPrice(features), [features]);
  const contributions = useMemo(() => explainPrice(features), [features]);
  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.value)));

  const update = <K extends keyof HouseFeatures>(k: K, v: HouseFeatures[K]) =>
    setFeatures((f) => ({ ...f, [k]: v }));

  const toggleAmenity = (a: AmenityKey) =>
    setFeatures((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Modern luxury home at golden hour"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 md:pb-24 md:pt-28">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold" />
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Estate Oracle · Regression Model v1
            </span>
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] text-balance md:text-7xl">
            Estimate a home's worth
            <br />
            <span className="italic text-primary/80">in a heartbeat.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A multivariate regression trained on 5,000 synthetic listings —
            weighing location, square footage, rooms, age, and amenities —
            distilled into an instant price estimate.
          </p>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
            <Metric label="R² score" value={MODEL_METRICS.r2.toFixed(3)} />
            <Metric label="Mean abs error" value={fmt(MODEL_METRICS.mae)} />
            <Metric
              label="Training samples"
              value={MODEL_METRICS.trainingSamples.toLocaleString()}
            />
          </dl>
        </div>
      </section>

      {/* Predictor */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          {/* Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
            <h2 className="font-display text-2xl">Property details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust the features — the estimate updates live.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Field label="Location">
                <select
                  value={features.location}
                  onChange={(e) => update("location", e.target.value as Location)}
                  className="input"
                >
                  {(Object.keys(LOCATION_LABELS) as Location[]).map((l) => (
                    <option key={l} value={l}>
                      {LOCATION_LABELS[l]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Condition">
                <select
                  value={features.condition}
                  onChange={(e) => update("condition", e.target.value as Condition)}
                  className="input"
                >
                  {(Object.keys(CONDITION_LABELS) as Condition[]).map((c) => (
                    <option key={c} value={c}>
                      {CONDITION_LABELS[c]}
                    </option>
                  ))}
                </select>
              </Field>

              <SliderField
                label="Living area"
                value={features.sqft}
                min={400}
                max={6000}
                step={50}
                suffix="sqft"
                onChange={(v) => update("sqft", v)}
              />
              <SliderField
                label="Age"
                value={features.age}
                min={0}
                max={100}
                step={1}
                suffix="years"
                onChange={(v) => update("age", v)}
              />

              <StepperField
                label="Bedrooms"
                value={features.bedrooms}
                min={0}
                max={10}
                onChange={(v) => update("bedrooms", v)}
              />
              <StepperField
                label="Bathrooms"
                value={features.bathrooms}
                min={0}
                max={8}
                onChange={(v) => update("bathrooms", v)}
              />
              <StepperField
                label="Garage spaces"
                value={features.garage}
                min={0}
                max={5}
                onChange={(v) => update("garage", v)}
              />
            </div>

            <div className="mt-8">
              <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Amenities
              </div>
              <div className="flex flex-wrap gap-2">
                {AMENITY_KEYS.map((a) => {
                  const active = features.amenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface hover:border-primary/40"
                      }`}
                    >
                      {AMENITY_LABELS[a]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Result */}
          <aside className="rounded-2xl border border-primary/10 bg-primary p-8 text-primary-foreground shadow-[var(--shadow-luxe)]">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-primary-foreground/60">
              Predicted value
            </div>
            <div className="mt-3 font-display text-5xl md:text-6xl">
              {fmt(price)}
            </div>
            <div className="mt-2 text-sm text-primary-foreground/60">
              ± {fmt(MODEL_METRICS.rmse)} typical error
            </div>

            <div className="mt-8 border-t border-primary-foreground/15 pt-6">
              <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
                Feature contribution
              </div>
              <ul className="space-y-3">
                {contributions.map((c) => {
                  const pct = (Math.abs(c.value) / maxAbs) * 100;
                  const negative = c.value < 0;
                  return (
                    <li key={c.label}>
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-foreground/80">
                          {c.label}
                        </span>
                        <span className="tabular-nums text-primary-foreground">
                          {negative ? "−" : "+"}
                          {fmt(Math.abs(c.value))}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-primary-foreground/10">
                        <div
                          className={`h-full rounded-full ${
                            negative ? "bg-destructive/70" : "bg-gold"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>

        {/* Model card */}
        <div className="mt-16 grid gap-6 rounded-2xl border border-border bg-surface p-8 md:grid-cols-3">
          <ModelNote
            title="Approach"
            body="Multivariate linear regression with location and condition as categorical multipliers on a sqft-driven base price."
          />
          <ModelNote
            title="Features"
            body="Location, living area, bedrooms, bathrooms, garage, age, condition and seven amenity flags."
          />
          <ModelNote
            title="Evaluation"
            body={`Held-out R² of ${MODEL_METRICS.r2}, MAE of ${fmt(
              MODEL_METRICS.mae,
            )} on a synthetic held-out set.`}
          />
        </div>
      </section>

      <style>{`
        .input {
          width: 100%;
          border-radius: var(--radius);
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: 0.6rem 0.85rem;
          font-size: 0.9rem;
          color: var(--color-foreground);
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px oklch(0.32 0.06 160 / 0.12); }
      `}</style>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-xl text-foreground">{value}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className="font-display text-base tabular-nums">
          {value.toLocaleString()} <span className="text-xs text-muted-foreground">{suffix}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-primary)]"
      />
    </div>
  );
}

function StepperField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-10 w-10 rounded-lg border border-border bg-surface text-lg hover:border-primary/40"
        >
          −
        </button>
        <div className="flex-1 rounded-lg border border-border bg-surface py-2 text-center font-display text-lg tabular-nums">
          {value}
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-10 w-10 rounded-lg border border-border bg-surface text-lg hover:border-primary/40"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ModelNote({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <h3 className="font-display text-lg">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
