"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FoodLogData, DayData, Targets } from "./page";

const tabs = ["Daily", "Weekly", "Monthly"] as const;
type Tab = (typeof tabs)[number];

const mealOrder = ["breakfast", "lunch", "dinner", "snack"] as const;
const mealLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

function formatDate(dateStr: string, relative = false): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round(
    (today.getTime() - date.getTime()) / 86400000
  );

  if (relative) {
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
}

function MacroBar({
  label,
  value,
  target,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  target: number | null;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const pct = target ? Math.min((value / target) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          {label}
        </span>
        <span className="font-medium tabular-nums">
          {Math.round(value)}
          {target ? (
            <span className="text-muted-foreground">
              {" "}
              / {Math.round(target)}
            </span>
          ) : null}
        </span>
      </div>
      {target ? (
        <div className="h-1.5 rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${color.replace("text-", "bg-")}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function DayDetail({ day, targets }: { day: DayData; targets: Targets }) {
  const hasMeals = Object.values(day.meals).some((m) => m.length > 0);

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/30">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-4">
          <MacroBar
            label="Calories"
            value={day.totals.calories}
            target={targets?.calories ?? null}
            icon={Flame}
            color="text-orange-400"
          />
          <MacroBar
            label="Protein"
            value={day.totals.protein}
            target={targets?.protein ?? null}
            icon={Beef}
            color="text-red-400"
          />
          <MacroBar
            label="Carbs"
            value={day.totals.carbs}
            target={targets?.carbs ?? null}
            icon={Wheat}
            color="text-amber-400"
          />
          <MacroBar
            label="Fat"
            value={day.totals.fat}
            target={targets?.fat ?? null}
            icon={Droplet}
            color="text-blue-400"
          />
        </CardContent>
      </Card>

      {hasMeals ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {mealOrder.map((type) => {
            const foods = day.meals[type];
            if (!foods || foods.length === 0) return null;
            return (
              <Card key={type} className="border-border/50 bg-card/30">
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {mealLabels[type]}
                  </Badge>
                  <div className="space-y-2">
                    {foods.map((food, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {food.amount} {food.unit}
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                          <span>{Math.round(food.calories)} cal</span>
                          <span className="ml-2">
                            {Math.round(food.protein)}p
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No meals logged.</p>
      )}
    </div>
  );
}

function WeeklyChart({ days }: { days: DayData[] }) {
  const reversed = [...days].reverse();
  const maxCal = Math.max(...reversed.map((d) => d.totals.calories), 1);

  return (
    <Card className="border-border/50 bg-card/30">
      <CardContent className="p-6">
        <div className="flex items-end justify-between gap-2 sm:gap-4" style={{ height: 200 }}>
          {reversed.map((day) => {
            const pct = (day.totals.calories / maxCal) * 100;
            const date = new Date(day.date + "T12:00:00");
            const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
            return (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1"
                style={{ height: "100%" }}
              >
                <span className="text-xs tabular-nums text-muted-foreground">
                  {Math.round(day.totals.calories)}
                </span>
                <div className="relative flex w-full flex-1 items-end justify-center">
                  <div
                    className="w-full max-w-10 rounded-t bg-primary/70 transition-all"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{dayLabel}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatShortDate(day.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 border-t border-border/30 pt-4 text-center text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground tabular-nums">
              {Math.round(days.reduce((s, d) => s + d.totals.calories, 0) / days.length)}
            </p>
            <p>Avg Cal</p>
          </div>
          <div>
            <p className="font-medium text-foreground tabular-nums">
              {Math.round(days.reduce((s, d) => s + d.totals.protein, 0) / days.length)}g
            </p>
            <p>Avg Protein</p>
          </div>
          <div>
            <p className="font-medium text-foreground tabular-nums">
              {Math.round(days.reduce((s, d) => s + d.totals.carbs, 0) / days.length)}g
            </p>
            <p>Avg Carbs</p>
          </div>
          <div>
            <p className="font-medium text-foreground tabular-nums">
              {Math.round(days.reduce((s, d) => s + d.totals.fat, 0) / days.length)}g
            </p>
            <p>Avg Fat</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyTable({ data }: { data: FoodLogData }) {
  const allDays = [
    ...data.days.map((d) => ({
      date: d.date,
      calories: d.totals.calories,
      protein: d.totals.protein,
      carbs: d.totals.carbs,
      fat: d.totals.fat,
    })),
    ...data.monthlySummary,
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Date</th>
            <th className="pb-2 px-4 font-medium text-right">Cal</th>
            <th className="pb-2 px-4 font-medium text-right">Protein</th>
            <th className="pb-2 px-4 font-medium text-right">Carbs</th>
            <th className="pb-2 pl-4 font-medium text-right">Fat</th>
          </tr>
        </thead>
        <tbody>
          {allDays.map((day) => (
            <tr key={day.date} className="border-b border-border/30">
              <td className="py-2 pr-4 text-muted-foreground">
                {formatDate(day.date)}
              </td>
              <td className="py-2 px-4 text-right tabular-nums">
                {Math.round(day.calories)}
              </td>
              <td className="py-2 px-4 text-right tabular-nums">
                {Math.round(day.protein)}g
              </td>
              <td className="py-2 px-4 text-right tabular-nums">
                {Math.round(day.carbs)}g
              </td>
              <td className="py-2 pl-4 text-right tabular-nums">
                {Math.round(day.fat)}g
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FoodLogViewer({ data }: { data: FoodLogData }) {
  const [activeTab, setActiveTab] = useState<Tab>("Daily");
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div className="mt-10 space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Daily Tab */}
      {activeTab === "Daily" && (
        <div className="space-y-6">
          {/* Day pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {data.days.map((day, i) => (
              <button
                key={day.date}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  selectedDay === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {i === 0 ? "Today" : i === 1 ? "Yesterday" : formatDate(day.date)}
              </button>
            ))}
          </div>

          {/* Selected day */}
          <DayDetail day={data.days[selectedDay]} targets={data.targets} />
        </div>
      )}

      {/* Weekly Tab */}
      {activeTab === "Weekly" && <WeeklyChart days={data.days} />}

      {/* Monthly Tab */}
      {activeTab === "Monthly" && <MonthlyTable data={data} />}

      {/* Footer */}
      <p className="pt-8 text-center text-xs text-muted-foreground">
        Tracked with Compass, my AI assistant&apos;s app.
      </p>
    </div>
  );
}
