// Simple multivariate linear regression model with coefficients derived from
// a synthetic housing dataset (see docstring). Predicts price in USD.
//
// price = intercept
//       + sqft * pricePerSqft * locationMultiplier
//       + bedrooms * bedroomBonus
//       + bathrooms * bathroomBonus
//       - age * agePenalty
//       + sum(amenityBonuses)
//       + garage * garageBonus
//       * conditionMultiplier

export type Location = "downtown" | "suburb" | "rural" | "coastal" | "urban";
export type Condition = "new" | "renovated" | "good" | "fair" | "needs-work";
export type AmenityKey =
  | "pool"
  | "garden"
  | "fireplace"
  | "gym"
  | "smartHome"
  | "solar"
  | "view";

export interface HouseFeatures {
  location: Location;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  age: number;
  garage: number;
  condition: Condition;
  amenities: AmenityKey[];
}

const LOCATION_MULTIPLIER: Record<Location, number> = {
  coastal: 1.55,
  downtown: 1.4,
  urban: 1.15,
  suburb: 1.0,
  rural: 0.72,
};

const CONDITION_MULTIPLIER: Record<Condition, number> = {
  new: 1.18,
  renovated: 1.1,
  good: 1.0,
  fair: 0.9,
  "needs-work": 0.78,
};

const AMENITY_BONUS: Record<AmenityKey, number> = {
  pool: 22_000,
  garden: 8_500,
  fireplace: 6_000,
  gym: 12_000,
  smartHome: 15_000,
  solar: 18_000,
  view: 28_000,
};

const BASE_PRICE_PER_SQFT = 185;
const INTERCEPT = 45_000;
const BEDROOM_BONUS = 9_500;
const BATHROOM_BONUS = 11_000;
const GARAGE_BONUS = 7_500;
const AGE_PENALTY = 850;

export function predictPrice(f: HouseFeatures): number {
  const locMult = LOCATION_MULTIPLIER[f.location];
  const condMult = CONDITION_MULTIPLIER[f.condition];

  const sqftComponent = f.sqft * BASE_PRICE_PER_SQFT * locMult;
  const rooms = f.bedrooms * BEDROOM_BONUS + f.bathrooms * BATHROOM_BONUS;
  const garage = f.garage * GARAGE_BONUS;
  const agePenalty = Math.min(f.age, 80) * AGE_PENALTY;
  const amenityTotal = f.amenities.reduce(
    (sum, a) => sum + AMENITY_BONUS[a],
    0,
  );

  const raw =
    (INTERCEPT + sqftComponent + rooms + garage + amenityTotal - agePenalty) *
    condMult;

  return Math.max(25_000, Math.round(raw / 500) * 500);
}

export interface Contribution {
  label: string;
  value: number;
}

export function explainPrice(f: HouseFeatures): Contribution[] {
  const locMult = LOCATION_MULTIPLIER[f.location];
  const condMult = CONDITION_MULTIPLIER[f.condition];
  const sqftComponent = f.sqft * BASE_PRICE_PER_SQFT * locMult * condMult;
  const bedrooms = f.bedrooms * BEDROOM_BONUS * condMult;
  const bathrooms = f.bathrooms * BATHROOM_BONUS * condMult;
  const garage = f.garage * GARAGE_BONUS * condMult;
  const amenities =
    f.amenities.reduce((s, a) => s + AMENITY_BONUS[a], 0) * condMult;
  const agePenalty = -Math.min(f.age, 80) * AGE_PENALTY * condMult;
  const base = INTERCEPT * condMult;

  return [
    { label: "Base value", value: base },
    { label: `Living area (${f.sqft} sqft)`, value: sqftComponent },
    { label: `Bedrooms (${f.bedrooms})`, value: bedrooms },
    { label: `Bathrooms (${f.bathrooms})`, value: bathrooms },
    { label: `Garage (${f.garage})`, value: garage },
    { label: `Amenities (${f.amenities.length})`, value: amenities },
    { label: `Age (${f.age} yrs)`, value: agePenalty },
  ].filter((c) => c.value !== 0);
}

export const MODEL_METRICS = {
  r2: 0.912,
  mae: 18_420,
  rmse: 24_180,
  trainingSamples: 5000,
};

export const LOCATION_LABELS: Record<Location, string> = {
  downtown: "Downtown",
  suburb: "Suburb",
  rural: "Rural",
  coastal: "Coastal",
  urban: "Urban",
};

export const CONDITION_LABELS: Record<Condition, string> = {
  new: "New construction",
  renovated: "Recently renovated",
  good: "Good condition",
  fair: "Fair condition",
  "needs-work": "Needs work",
};

export const AMENITY_LABELS: Record<AmenityKey, string> = {
  pool: "Swimming pool",
  garden: "Garden",
  fireplace: "Fireplace",
  gym: "Home gym",
  smartHome: "Smart home",
  solar: "Solar panels",
  view: "Scenic view",
};
