const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_DAYS = 7;
const MONTH_DAYS = 30;

export function formatDelayLabel(dueAt: string, now: Date) {
  const diffMs = Math.max(0, Date.parse(dueAt) - now.getTime());

  if (diffMs < DAY_MS) {
    const minutes = Math.max(1, Math.round(diffMs / MINUTE_MS));

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }

    const hours = Math.max(1, Math.round(diffMs / HOUR_MS));
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const days = Math.max(1, Math.round(diffMs / DAY_MS));

  if (days <= WEEK_DAYS) {
    return `${days} day${days === 1 ? '' : 's'}`;
  }

  if (days < MONTH_DAYS) {
    const weeks = Math.max(1, Math.round(days / WEEK_DAYS));
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  const months = Math.max(1, Math.round(days / MONTH_DAYS));
  return `${months} month${months === 1 ? '' : 's'}`;
}
