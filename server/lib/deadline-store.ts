import type { DeadlineItem, DeadlineStatus } from "../../shared/api";

const deadlineStore = new Map<string, DeadlineItem[]>();

function resolveStatus(dueAt: string): DeadlineStatus {
  return new Date(dueAt).getTime() < Date.now() ? "missed" : "upcoming";
}

export function getDeadlinesForUser(userId: string): DeadlineItem[] {
  const existing = deadlineStore.get(userId) ?? [];

  const normalized = existing
    .map((item) => ({
      ...item,
      status: resolveStatus(item.dueAt),
    }))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  deadlineStore.set(userId, normalized);
  return normalized;
}

export function addDeadlineForUser(
  userId: string,
  payload: { subject: string; dueAt: string },
): DeadlineItem {
  const nextItem: DeadlineItem = {
    id: `deadline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subject: payload.subject,
    dueAt: payload.dueAt,
    status: resolveStatus(payload.dueAt),
    createdAt: new Date().toISOString(),
  };

  const current = getDeadlinesForUser(userId);
  const updated = [...current, nextItem].sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
  );

  deadlineStore.set(userId, updated);
  return nextItem;
}

export function removeDeadlineForUser(userId: string, deadlineId: string): boolean {
  const current = getDeadlinesForUser(userId);
  const filtered = current.filter((item) => item.id !== deadlineId);

  deadlineStore.set(userId, filtered);
  return filtered.length !== current.length;
}
