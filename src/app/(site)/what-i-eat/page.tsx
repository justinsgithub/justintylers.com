import { Metadata } from "next";
import { FoodLogViewer } from "./food-log-viewer";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "What I Eat",
  description:
    "Daily food logs my AI helps me maintain. Food is data. Our bodies evolved to process whole foods. Processed foods are unknown data types.",
};

export type FoodEntry = {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DayData = {
  date: string;
  meals: Record<string, FoodEntry[]>;
  totals: { calories: number; protein: number; carbs: number; fat: number };
};

export type DaySummary = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Targets = {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
} | null;

export type FoodLogData = {
  days: DayData[];
  targets: Targets;
  monthlySummary: DaySummary[];
};

const COMPASS_URL =
  process.env.COMPASS_API_URL || "https://compass.justintylers.com";

async function getFoodLog(): Promise<FoodLogData | null> {
  try {
    const res = await fetch(`${COMPASS_URL}/api/public/food-log`, {
      headers: { "X-Public-Key": process.env.COMPASS_PUBLIC_KEY || "" },
      next: { revalidate: 7200 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function WhatIEatPage() {
  const data = await getFoodLog();

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          What I Eat
        </h1>
        <p className="mt-6 text-muted-foreground">
          Food log is temporarily unavailable. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        What I Eat
      </h1>
      <div className="mt-4 space-y-3 text-muted-foreground">
        <p>
          Just daily food logs my AI helps me maintain.
        </p>
        <p>
          I think of food as data. Our bodies spent millions of years
          building metabolic pathways to process specific data types: whole
          foods, plants, animals, things that exist in nature. Ultra-processed
          foods have existed for maybe 70 years. That&apos;s an evolutionary
          blink.
        </p>
        <p>
          When the body encounters an unknown data type it can&apos;t parse,
          the excess gets dumped into fat storage like untyped blobs thrown on
          the heap. Corrupted data also causes bugs throughout the system.
          Inflammation, acne, joint pain, brain fog. Our bodies literally do
          not have the code to handle what we keep feeding them.
        </p>
        <p>
          I keep my diet as simple as possible. Mostly whole foods, minimal
          processing, close to nature. Grocery shopping and cooking are some
          of my least favorite things so simple works for me anyway.
        </p>
      </div>
      <FoodLogViewer data={data} />
    </div>
  );
}
