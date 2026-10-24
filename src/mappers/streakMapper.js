import { todayInZone, countDays } from '../utils/dates.js';

export function toStreakDto(streak, timeZone, today = todayInZone(timeZone)) {
  return {
    id: String(streak._id),
    title: streak.title,
    startDate: streak.startDate,
    color: streak.color,
    days: countDays(streak.startDate, today),
    today,
    timeZone
  };
}
