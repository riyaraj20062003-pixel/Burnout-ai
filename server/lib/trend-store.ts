import type { BurnoutTrendPoint } from "../../shared/api";

const trendStore = new Map<string, BurnoutTrendPoint[]>();

function toTimeLabel(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function seedTrendSeries(): BurnoutTrendPoint[] {
  const now = Date.now();
  const seed: BurnoutTrendPoint[] = [];

  for (let index = 6; index >= 0; index -= 1) {
    const at = new Date(now - index * 60 * 60 * 1000);
    const burnout = Math.round(30 + (6 - index) * 4 + Math.sin(index) * 5);
    const stress = Math.round(4 + (6 - index) * 0.5 + Math.cos(index) * 0.7);
    const sleep = Number((7.5 - (6 - index) * 0.2 + Math.sin(index * 0.5) * 0.4).toFixed(1));

    seed.push({
      timestamp: at.toISOString(),
      label: toTimeLabel(at),
      burnout: Math.max(5, Math.min(95, burnout)),
      stress: Math.max(1, Math.min(10, stress)),
      sleep: Math.max(3, Math.min(10, sleep)),
    });
  }

  return seed;
}

export function getTrendSeriesForUser(userId: string): BurnoutTrendPoint[] {
  const existing = trendStore.get(userId);
  if (!existing || existing.length === 0) {
    const seeded = seedTrendSeries();
    trendStore.set(userId, seeded);
    return seeded;
  }

  return existing;
}

export function addTrendSnapshotForUser(
  userId: string,
  snapshot: { burnout: number; stress: number; sleep: number },
): BurnoutTrendPoint[] {
  const current = getTrendSeriesForUser(userId);
  const now = new Date();

  const nextPoint: BurnoutTrendPoint = {
    timestamp: now.toISOString(),
    label: toTimeLabel(now),
    burnout: Math.max(0, Math.min(100, Math.round(snapshot.burnout))),
    stress: Math.max(0, Math.min(10, Number(snapshot.stress.toFixed(1)))),
    sleep: Math.max(0, Math.min(24, Number(snapshot.sleep.toFixed(1)))),
  };

  const next = [...current, nextPoint].slice(-16);
  trendStore.set(userId, next);

  return next;
}
